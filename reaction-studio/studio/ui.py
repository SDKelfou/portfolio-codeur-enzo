"""Interface principale CustomTkinter : avatars, montage, batch export."""

import threading
from pathlib import Path
from tkinter import filedialog, messagebox

import customtkinter as ctk

from .audio import MicMonitor
from .avatar_window import AvatarWindow
from .config import load_config, save_config
from .render import batch_export

try:
    from tkinterdnd2 import DND_FILES, TkinterDnD
    HAS_DND = True
except ImportError:
    HAS_DND = False

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

VIDEO_TYPES = [("Vidéos", "*.mp4 *.mkv *.mov *.webm *.avi"), ("Tous", "*.*")]
IMAGE_TYPES = [("Images PNG", "*.png"), ("Tous", "*.*")]
AVATAR_KEYS = [("idle", "Idle"), ("blink", "Blink"), ("talk", "Talk"), ("talk_blink", "Talk Blink")]


class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("🎬 Studio de Réaction Multi-Shorts")
        self.geometry("980x760")
        self.config_data = load_config()
        self.mic = MicMonitor()
        self.mic.start()
        self.rec_path = ""
        self.short_path = ""

        tabs = ctk.CTkTabview(self)
        tabs.pack(fill="both", expand=True, padx=14, pady=14)
        self.tab_avatars = tabs.add("🎭 Avatars")
        self.tab_montage = tabs.add("🎞️ Montage & Export")
        self.tab_channels = tabs.add("📺 Chaînes")

        self._build_avatars_tab()
        self._build_montage_tab()
        self._build_channels_tab()
        self.protocol("WM_DELETE_WINDOW", self._on_close)

    # ------------------------------------------------------------- Avatars
    def _build_avatars_tab(self):
        frame = ctk.CTkScrollableFrame(self.tab_avatars)
        frame.pack(fill="both", expand=True)
        self.avatar_labels = {}

        for slot_id in ("1", "2", "3"):
            slot = self.config_data["avatars"][slot_id]
            card = ctk.CTkFrame(frame)
            card.pack(fill="x", pady=8, padx=6)

            head = ctk.CTkFrame(card, fg_color="transparent")
            head.pack(fill="x", padx=10, pady=(10, 4))
            name_var = ctk.StringVar(value=slot.get("name", f"Perso {slot_id}"))
            entry = ctk.CTkEntry(head, textvariable=name_var, width=200)
            entry.pack(side="left")
            name_var.trace_add(
                "write",
                lambda *_a, sid=slot_id, v=name_var: self._set_avatar(sid, "name", v.get()),
            )
            ctk.CTkButton(
                head, text="▶ Ouvrir la fenêtre OBS (fond vert)",
                command=lambda sid=slot_id: self._open_avatar(sid),
            ).pack(side="right")

            grid = ctk.CTkFrame(card, fg_color="transparent")
            grid.pack(fill="x", padx=10, pady=(0, 6))
            self.avatar_labels[slot_id] = {}
            for col, (key, label) in enumerate(AVATAR_KEYS):
                ctk.CTkButton(
                    grid, text=f"🖼️ {label}", width=140,
                    command=lambda sid=slot_id, k=key: self._pick_avatar_image(sid, k),
                ).grid(row=0, column=col, padx=4, pady=2)
                lbl = ctk.CTkLabel(
                    grid, text=self._short_name(slot.get(key, "")),
                    width=140, font=("", 10), text_color="gray",
                )
                lbl.grid(row=1, column=col, padx=4)
                self.avatar_labels[slot_id][key] = lbl

            thr_frame = ctk.CTkFrame(card, fg_color="transparent")
            thr_frame.pack(fill="x", padx=10, pady=(0, 10))
            ctk.CTkLabel(thr_frame, text="Seuil voix :").pack(side="left")
            thr = ctk.CTkSlider(
                thr_frame, from_=0.005, to=0.2, width=300,
                command=lambda v, sid=slot_id: self._set_avatar(sid, "threshold", round(float(v), 3)),
            )
            thr.set(float(slot.get("threshold", 0.04)))
            thr.pack(side="left", padx=8)

    @staticmethod
    def _short_name(path: str) -> str:
        return Path(path).name if path else "— non assigné —"

    def _set_avatar(self, slot_id: str, key: str, value):
        self.config_data["avatars"][slot_id][key] = value
        save_config(self.config_data)

    def _pick_avatar_image(self, slot_id: str, key: str):
        path = filedialog.askopenfilename(filetypes=IMAGE_TYPES)
        if path:
            self._set_avatar(slot_id, key, path)
            self.avatar_labels[slot_id][key].configure(text=self._short_name(path))

    def _open_avatar(self, slot_id: str):
        slot = self.config_data["avatars"][slot_id]
        if not slot.get("idle"):
            messagebox.showwarning("Avatar incomplet", "Assigne au moins l'image Idle.")
            return
        AvatarWindow(self, slot, self.mic)

    # ------------------------------------------------------------- Montage
    def _build_montage_tab(self):
        frame = ctk.CTkFrame(self.tab_montage, fg_color="transparent")
        frame.pack(fill="both", expand=True, padx=10, pady=10)

        self.rec_label = self._drop_zone(
            frame, "🎥 REC OBS (ta réaction)", lambda p: self._set_video("rec", p)
        )
        self.short_label = self._drop_zone(
            frame, "📱 Short source (vidéo réagie)", lambda p: self._set_video("short", p)
        )

        opts = ctk.CTkFrame(frame)
        opts.pack(fill="x", pady=10)
        self.subs_var = ctk.BooleanVar(value=self.config_data["subtitles"].get("enabled", True))
        ctk.CTkCheckBox(
            opts, text="Sous-titres dynamiques automatiques (style Shorts)",
            variable=self.subs_var,
        ).pack(side="left", padx=12, pady=12)
        ctk.CTkLabel(opts, text="Nom du projet :").pack(side="left", padx=(20, 4))
        self.project_var = ctk.StringVar(value="mon_short")
        ctk.CTkEntry(opts, textvariable=self.project_var, width=200).pack(side="left")

        self.export_btn = ctk.CTkButton(
            frame, text="🚀 LANCER L'EXPORT GROUPÉ (3 chaînes en parallèle)",
            height=56, font=("", 17, "bold"), fg_color="#16a34a", hover_color="#15803d",
            command=self._launch_batch,
        )
        self.export_btn.pack(fill="x", pady=12)

        self.log = ctk.CTkTextbox(frame, height=220)
        self.log.pack(fill="both", expand=True)
        self.log.insert("end", "Prêt. Glisse (ou choisis) tes 2 vidéos puis lance l'export.\n")

    def _drop_zone(self, parent, title: str, setter):
        zone = ctk.CTkFrame(parent, border_width=2, border_color="#3b82f6")
        zone.pack(fill="x", pady=6)
        ctk.CTkLabel(zone, text=title, font=("", 14, "bold")).pack(pady=(10, 2))
        label = ctk.CTkLabel(zone, text="Glisse un fichier ici ou clique « Parcourir »", text_color="gray")
        label.pack()
        ctk.CTkButton(
            zone, text="📂 Parcourir", width=120,
            command=lambda: self._browse_video(setter, label),
        ).pack(pady=(4, 10))
        if HAS_DND:
            for w in (zone, label):
                w.drop_target_register(DND_FILES)
                w.dnd_bind(
                    "<<Drop>>",
                    lambda e, s=setter, l=label: self._on_drop(e, s, l),
                )
        return label

    def _on_drop(self, event, setter, label):
        path = event.data.strip("{}").split("} {")[0]
        setter(path)
        label.configure(text=Path(path).name, text_color="#4ade80")

    def _browse_video(self, setter, label):
        path = filedialog.askopenfilename(filetypes=VIDEO_TYPES)
        if path:
            setter(path)
            label.configure(text=Path(path).name, text_color="#4ade80")

    def _set_video(self, which: str, path: str):
        if which == "rec":
            self.rec_path = path
        else:
            self.short_path = path

    # ------------------------------------------------------------- Chaînes
    def _build_channels_tab(self):
        frame = ctk.CTkFrame(self.tab_channels, fg_color="transparent")
        frame.pack(fill="both", expand=True, padx=10, pady=10)
        for i, ch in enumerate(self.config_data["channels"]):
            card = ctk.CTkFrame(frame)
            card.pack(fill="x", pady=8)
            row = ctk.CTkFrame(card, fg_color="transparent")
            row.pack(fill="x", padx=10, pady=10)
            for field, label, width in (
                ("name", "Nom", 160), ("watermark", "Watermark", 180), ("suffix", "Suffixe", 100),
            ):
                ctk.CTkLabel(row, text=label).pack(side="left", padx=(8, 2))
                var = ctk.StringVar(value=ch.get(field, ""))
                ctk.CTkEntry(row, textvariable=var, width=width).pack(side="left")
                var.trace_add(
                    "write",
                    lambda *_a, idx=i, f=field, v=var: self._set_channel(idx, f, v.get()),
                )
            ctk.CTkButton(
                row, text="📁 Dossier de sortie", width=150,
                command=lambda idx=i: self._pick_out_dir(idx),
            ).pack(side="right", padx=8)

    def _set_channel(self, idx: int, field: str, value: str):
        self.config_data["channels"][idx][field] = value
        save_config(self.config_data)

    def _pick_out_dir(self, idx: int):
        path = filedialog.askdirectory()
        if path:
            self._set_channel(idx, "output_dir", path)

    # ------------------------------------------------------------- Export
    def _log(self, msg: str):
        self.after(0, lambda: (self.log.insert("end", msg + "\n"), self.log.see("end")))

    def _launch_batch(self):
        if not self.rec_path or not self.short_path:
            messagebox.showwarning("Fichiers manquants", "Il faut le REC OBS ET le Short source.")
            return
        self.config_data["subtitles"]["enabled"] = self.subs_var.get()
        save_config(self.config_data)
        self.export_btn.configure(state="disabled", text="⏳ Export en cours…")
        threading.Thread(target=self._batch_worker, daemon=True).start()

    def _batch_worker(self):
        try:
            results = batch_export(
                self.rec_path,
                self.short_path,
                self.config_data["channels"],
                self.config_data,
                project_name=self.project_var.get() or "short",
                subtitles_enabled=self.subs_var.get(),
                progress=self._log,
            )
            self._log(f"\n🎉 Terminé ! {len(results)} vidéos prêtes pour tes chaînes.")
        except Exception as exc:
            self._log(f"\n❌ Erreur : {exc}")
        finally:
            self.after(0, lambda: self.export_btn.configure(
                state="normal", text="🚀 LANCER L'EXPORT GROUPÉ (3 chaînes en parallèle)",
            ))

    def _on_close(self):
        self.mic.stop()
        self.destroy()


def run():
    if HAS_DND:
        # tkinterdnd2 doit patcher la racine Tk : CTk hérite de Tk, on injecte le mixin
        class DnDApp(TkinterDnD.DnDWrapper, App):
            def __init__(self):
                App.__init__(self)
                self.TkdndVersion = TkinterDnD._require(self)

        app = DnDApp()
    else:
        app = App()
    app.mainloop()
