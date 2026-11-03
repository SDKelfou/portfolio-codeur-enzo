"""Sous-titres dynamiques style Shorts : transcription Whisper → fichier .ass animé."""

from pathlib import Path

try:
    from faster_whisper import WhisperModel
    HAS_WHISPER = True
except ImportError:
    HAS_WHISPER = False

ASS_HEADER = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Shorts,{font},{size},{color},&H000000FF,{outline},&H64000000,-1,0,0,0,100,100,0,0,1,6,2,5,40,40,960,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def _ts(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def _group_words(words, max_words: int = 3):
    """Groupe les mots par 2-3 pour l'effet 'pop' des Shorts."""
    group = []
    for w in words:
        group.append(w)
        if len(group) >= max_words:
            yield group
            group = []
    if group:
        yield group


def generate_ass(video_path: str, out_path: str, settings: dict, progress=None) -> str:
    """Transcrit l'audio de la vidéo et écrit un .ass animé. Retourne out_path."""
    if not HAS_WHISPER:
        raise RuntimeError(
            "faster-whisper n'est pas installé : pip install faster-whisper"
        )
    if progress:
        progress("Chargement du modèle Whisper…")
    model = WhisperModel(settings.get("model", "small"), compute_type="int8")

    if progress:
        progress("Transcription en cours…")
    segments, _info = model.transcribe(
        video_path,
        language=settings.get("language") or None,
        word_timestamps=True,
        vad_filter=True,
    )

    header = ASS_HEADER.format(
        font=settings.get("font", "Arial Black"),
        size=settings.get("size", 72),
        color=settings.get("color", "&H00FFFFFF"),
        outline=settings.get("outline_color", "&H00000000"),
    )
    highlight = settings.get("highlight_color", "&H0000D7FF")

    lines = [header]
    for seg in segments:
        words = seg.words or []
        for group in _group_words(words):
            start, end = group[0].start, group[-1].end
            if end - start < 0.05:
                end = start + 0.05
            # pop-in : scale 60% -> 110% -> 100% sur les 120 premières ms
            anim = r"{\fscx60\fscy60\t(0,80,\fscx112\fscy112)\t(80,140,\fscx100\fscy100)}"
            text = anim + " ".join(
                rf"{{\c{highlight}}}{w.word.strip()}{{\c&H00FFFFFF&}}"
                if i == len(group) - 1 and len(group) > 1
                else w.word.strip()
                for i, w in enumerate(group)
            )
            lines.append(
                f"Dialogue: 0,{_ts(start)},{_ts(end)},Shorts,,0,0,0,,{text}"
            )

    Path(out_path).write_text("\n".join(lines), encoding="utf-8")
    if progress:
        progress("Sous-titres générés.")
    return out_path
