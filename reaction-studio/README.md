# 🎬 Studio de Réaction Multi-Shorts Automatisé

Application desktop tout-en-un pour chaînes YouTube Shorts : avatars PNGTuber pour OBS,
auto-montage 9:16 avec sous-titres dynamiques, et export groupé **3 chaînes en parallèle**
en un seul clic.

## Installation

1. **Python 3.10+** requis.
2. **FFmpeg** doit être dans le PATH : `winget install Gyan.FFmpeg` (puis rouvrir le terminal).
3. Dépendances :

```bash
pip install -r requirements.txt
```

ou directement :

```bash
pip install customtkinter pillow numpy sounddevice faster-whisper tkinterdnd2
```

4. Lancer :

```bash
python main.py
```

## Workflow

### 1. 🎭 Onglet Avatars
- 3 slots de personnages ; assigne une fois les 4 PNG (Idle, Blink, Talk, Talk Blink) —
  tout est sauvegardé dans `config.json`.
- Règle le **seuil voix** (sensibilité micro) par personnage.
- « Ouvrir la fenêtre OBS » ouvre une fenêtre à fond vert `#00FF00` : capture-la dans OBS
  avec un filtre **Incrustation couleur (chroma key)**.
- Animations : respiration idle, clignements aléatoires, bouche + bounce quand tu parles.

### 2. 🎞️ Onglet Montage & Export
- Glisse (ou choisis) ton **REC OBS** et le **Short source**.
- Layout automatique 1080×1920 : réaction en haut, Short en bas (hauteurs réglables dans `config.json`).
- Case **Sous-titres dynamiques** : transcription locale (faster-whisper) → sous-titres
  animés style Shorts (pop par groupes de mots, dernier mot surligné), incrustés au rendu.

### 3. 📺 Onglet Chaînes + Export groupé
- Configure nom, watermark, suffixe et dossier de sortie de chaque chaîne.
- **Un seul bouton** : le montage lourd est rendu **une seule fois**, puis les 3 variantes
  (watermark par chaîne) sont exportées **en parallèle**. Zéro répétition.

## Structure

```
reaction-studio/
├── main.py              # point d'entrée
├── config.json          # créé automatiquement (avatars, chaînes, réglages)
├── requirements.txt
└── studio/
    ├── config.py        # chargement/sauvegarde config
    ├── audio.py         # niveau micro temps réel (RMS)
    ├── avatar_window.py # fenêtres PNGTuber fond vert
    ├── subtitles.py     # Whisper → sous-titres .ass animés
    ├── render.py        # montage FFmpeg + batch export parallèle
    └── ui.py            # interface CustomTkinter
```

## Notes
- Le premier export avec sous-titres télécharge le modèle Whisper (~500 Mo pour `small`) ;
  change `subtitles.model` dans `config.json` (`tiny`, `base`, `small`, `medium`).
- L'audio final = piste audio de ton REC OBS (qui contient déjà ta voix + le son du Short).
- Sans watermark, la variante chaîne est une copie sans ré-encodage (quasi instantanée).
