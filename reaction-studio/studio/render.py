"""Montage 9:16 (1080x1920) + batch export parallèle via FFmpeg.

Principe "une seule passe lourde" :
1. compose_base() rend UNE fois le montage complet (layout + sous-titres) ;
2. batch_export() lance en PARALLÈLE un ffmpeg léger par chaîne
   (watermark par chaîne, audio copié tel quel).
"""

import shutil
import subprocess
import tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

W, H = 1080, 1920


def ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def _run(cmd: list[str]) -> None:
    proc = subprocess.run(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        encoding="utf-8", errors="replace",
    )
    if proc.returncode != 0:
        raise RuntimeError(f"FFmpeg a échoué :\n{proc.stderr[-2000:]}")


def _escape_filter_path(path: str) -> str:
    """Échappe un chemin Windows pour un filtre ffmpeg (ass=...)."""
    return path.replace("\\", "/").replace(":", "\\:").replace("'", "\\'")


def compose_base(
    rec_path: str,
    short_path: str,
    out_path: str,
    export_cfg: dict,
    layout_cfg: dict,
    ass_path: str | None = None,
    progress=None,
) -> str:
    """Rend le montage 9:16 : réaction en haut, Short source en bas."""
    if progress:
        progress("Rendu du montage de base (passe unique)…")

    react_h = int(layout_cfg.get("reaction_height", 770))
    short_h = H - react_h

    filters = (
        f"[0:v]scale={W}:{react_h}:force_original_aspect_ratio=increase,"
        f"crop={W}:{react_h}[top];"
        f"[1:v]scale={W}:{short_h}:force_original_aspect_ratio=increase,"
        f"crop={W}:{short_h}[bot];"
        f"[top][bot]vstack=inputs=2,format=yuv420p[stacked]"
    )
    last = "[stacked]"
    if ass_path:
        filters += f";{last}ass='{_escape_filter_path(ass_path)}'[subbed]"
        last = "[subbed]"

    cmd = [
        "ffmpeg", "-y",
        "-i", rec_path,
        "-i", short_path,
        "-filter_complex", filters,
        "-map", last,
        "-map", "0:a?",
        "-shortest",
        "-r", str(export_cfg.get("fps", 30)),
        "-c:v", "libx264",
        "-crf", str(export_cfg.get("crf", 20)),
        "-preset", export_cfg.get("preset", "veryfast"),
        "-c:a", "aac", "-b:a", export_cfg.get("audio_bitrate", "192k"),
        out_path,
    ]
    _run(cmd)
    return out_path


def _export_channel(base_path: str, channel: dict, project_name: str, export_cfg: dict) -> str:
    out_dir = Path(channel.get("output_dir") or Path(base_path).parent)
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{project_name}{channel.get('suffix', '')}.mp4"

    watermark = (channel.get("watermark") or "").replace("'", r"\'").replace(":", r"\:")
    if watermark:
        drawtext = (
            f"drawtext=text='{watermark}':fontsize=42:fontcolor=white@0.85:"
            f"borderw=2:bordercolor=black@0.6:x=(w-text_w)/2:y=60"
        )
        cmd = [
            "ffmpeg", "-y", "-i", base_path,
            "-vf", drawtext,
            "-c:v", "libx264",
            "-crf", str(export_cfg.get("crf", 20)),
            "-preset", export_cfg.get("preset", "veryfast"),
            "-c:a", "copy",
            str(out),
        ]
    else:
        cmd = ["ffmpeg", "-y", "-i", base_path, "-c", "copy", str(out)]
    _run(cmd)
    return str(out)


def batch_export(
    rec_path: str,
    short_path: str,
    channels: list[dict],
    config: dict,
    project_name: str = "short",
    subtitles_enabled: bool = False,
    progress=None,
) -> list[str]:
    """Workflow complet : [sous-titres] → base unique → 3 exports en parallèle."""
    if not ffmpeg_available():
        raise RuntimeError("FFmpeg introuvable dans le PATH. Installe-le : https://ffmpeg.org")

    tmp_dir = Path(tempfile.mkdtemp(prefix="reaction_studio_"))
    ass_path = None
    if subtitles_enabled:
        from .subtitles import generate_ass
        ass_path = str(tmp_dir / "subs.ass")
        generate_ass(rec_path, ass_path, config.get("subtitles", {}), progress=progress)

    base = str(tmp_dir / "base.mp4")
    compose_base(
        rec_path, short_path, base,
        config.get("export", {}), config.get("layout", {}),
        ass_path=ass_path, progress=progress,
    )

    if progress:
        progress(f"Export parallèle de {len(channels)} versions…")
    results = []
    with ThreadPoolExecutor(max_workers=len(channels)) as pool:
        futures = {
            pool.submit(_export_channel, base, ch, project_name, config.get("export", {})): ch
            for ch in channels
        }
        for fut in as_completed(futures):
            ch = futures[fut]
            path = fut.result()
            results.append(path)
            if progress:
                progress(f"✅ {ch.get('name', '?')} → {path}")

    shutil.rmtree(tmp_dir, ignore_errors=True)
    return results
