"""Gestion du config.json : avatars, chaînes, sous-titres, export."""

import json
import os
from pathlib import Path

CONFIG_PATH = Path(__file__).resolve().parent.parent / "config.json"

DEFAULT_CONFIG = {
    "avatars": {
        "1": {"name": "Perso 1", "idle": "", "blink": "", "talk": "", "talk_blink": "", "threshold": 0.04},
        "2": {"name": "Perso 2", "idle": "", "blink": "", "talk": "", "talk_blink": "", "threshold": 0.04},
        "3": {"name": "Perso 3", "idle": "", "blink": "", "talk": "", "talk_blink": "", "threshold": 0.04},
    },
    "channels": [
        {"name": "Chaine 1", "watermark": "@chaine1", "suffix": "_ch1", "output_dir": ""},
        {"name": "Chaine 2", "watermark": "@chaine2", "suffix": "_ch2", "output_dir": ""},
        {"name": "Chaine 3", "watermark": "@chaine3", "suffix": "_ch3", "output_dir": ""},
    ],
    "subtitles": {
        "enabled": True,
        "model": "small",
        "language": "fr",
        "font": "Arial Black",
        "size": 72,
        "color": "&H00FFFFFF",
        "outline_color": "&H00000000",
        "highlight_color": "&H0000D7FF",
    },
    "export": {"fps": 30, "crf": 20, "preset": "veryfast", "audio_bitrate": "192k"},
    "layout": {"reaction_height": 770, "short_height": 1150},
}


def _deep_merge(base: dict, override: dict) -> dict:
    out = dict(base)
    for k, v in override.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _deep_merge(out[k], v)
        else:
            out[k] = v
    return out


def load_config() -> dict:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return _deep_merge(DEFAULT_CONFIG, json.load(f))
        except (json.JSONDecodeError, OSError):
            pass
    return json.loads(json.dumps(DEFAULT_CONFIG))


def save_config(config: dict) -> None:
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
