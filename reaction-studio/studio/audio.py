"""Monitoring micro en temps réel (niveau RMS) pour piloter la bouche de l'avatar."""

import threading

import numpy as np

try:
    import sounddevice as sd
    HAS_AUDIO = True
except (ImportError, OSError):
    HAS_AUDIO = False


class MicMonitor:
    """Écoute le micro en continu et expose le niveau RMS courant (0.0 → ~1.0)."""

    def __init__(self, samplerate: int = 16000, blocksize: int = 512):
        self.samplerate = samplerate
        self.blocksize = blocksize
        self._level = 0.0
        self._lock = threading.Lock()
        self._stream = None

    @property
    def level(self) -> float:
        with self._lock:
            return self._level

    def _callback(self, indata, frames, time_info, status):
        rms = float(np.sqrt(np.mean(np.square(indata[:, 0]))))
        with self._lock:
            # lissage léger pour éviter le clignotement de bouche
            self._level = 0.6 * self._level + 0.4 * rms

    def start(self):
        if not HAS_AUDIO or self._stream is not None:
            return
        try:
            self._stream = sd.InputStream(
                channels=1,
                samplerate=self.samplerate,
                blocksize=self.blocksize,
                callback=self._callback,
            )
            self._stream.start()
        except Exception:
            self._stream = None

    def stop(self):
        if self._stream is not None:
            try:
                self._stream.stop()
                self._stream.close()
            finally:
                self._stream = None
