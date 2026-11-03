"""Fenêtre PNGTuber à fond vert (chroma key #00FF00) prête pour OBS.

Animations :
- respiration idle (oscillation verticale douce)
- clignements aléatoires (toutes les 2.5 à 6 s, ~150 ms)
- bouche ouverte + bounce/tremblement quand le micro dépasse le seuil
"""

import math
import random
import time
import tkinter as tk

from PIL import Image, ImageTk

from .audio import MicMonitor

CHROMA = "#00FF00"
FPS = 30
AVATAR_SIZE = 512  # taille max de rendu de l'avatar dans la fenêtre


class AvatarWindow(tk.Toplevel):
    """Une fenêtre par personnage, à capturer dans OBS avec un filtre chroma key."""

    def __init__(self, master, slot: dict, mic: MicMonitor):
        super().__init__(master)
        self.title(f"PNGTuber — {slot.get('name', 'Avatar')}")
        self.configure(bg=CHROMA)
        self.geometry("600x600")
        self.mic = mic
        self.threshold = float(slot.get("threshold", 0.04))

        self.images = {}
        for key in ("idle", "blink", "talk", "talk_blink"):
            path = slot.get(key, "")
            self.images[key] = self._load(path) if path else None

        self.canvas = tk.Canvas(self, bg=CHROMA, highlightthickness=0)
        self.canvas.pack(fill="both", expand=True)
        self.sprite = self.canvas.create_image(300, 300, image=None)

        self._blinking = False
        self._next_blink = time.monotonic() + random.uniform(2.5, 6.0)
        self._blink_end = 0.0
        self._t0 = time.monotonic()
        self._alive = True
        self.protocol("WM_DELETE_WINDOW", self._close)
        self._tick()

    def _load(self, path: str):
        try:
            img = Image.open(path).convert("RGBA")
            img.thumbnail((AVATAR_SIZE, AVATAR_SIZE), Image.LANCZOS)
            return ImageTk.PhotoImage(img)
        except Exception:
            return None

    def _current_image(self, talking: bool):
        now = time.monotonic()
        if not self._blinking and now >= self._next_blink:
            self._blinking = True
            self._blink_end = now + 0.15
        if self._blinking and now >= self._blink_end:
            self._blinking = False
            self._next_blink = now + random.uniform(2.5, 6.0)

        if talking and self._blinking:
            key = "talk_blink"
        elif talking:
            key = "talk"
        elif self._blinking:
            key = "blink"
        else:
            key = "idle"
        return self.images.get(key) or self.images.get("idle")

    def _tick(self):
        if not self._alive:
            return
        t = time.monotonic() - self._t0
        talking = self.mic.level > self.threshold

        # respiration idle : oscillation verticale lente
        breathe = math.sin(t * 2.0) * 5
        dx, dy = 0.0, breathe
        if talking:
            # bounce + léger tremblement pendant la parole
            dy += -12 * abs(math.sin(t * 10.0))
            dx += random.uniform(-2, 2)

        img = self._current_image(talking)
        if img is not None:
            w = max(self.canvas.winfo_width(), 1)
            h = max(self.canvas.winfo_height(), 1)
            self.canvas.itemconfig(self.sprite, image=img)
            self.canvas.coords(self.sprite, w / 2 + dx, h / 2 + dy)

        self.after(int(1000 / FPS), self._tick)

    def _close(self):
        self._alive = False
        self.destroy()
