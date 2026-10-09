"""Line protocol shared by every engine worker.

The game server starts a worker per engine and talks to it over stdin/stdout, one JSON object
per line. A request is ``{"id": 1, "text": "...", "voice": "xenia", "out": "/abs/path.mp3"}``, plus an
optional ``"tune"`` object that shapes the voice (see ``Tune``);
the worker writes the audio to ``out`` and answers ``{"id": 1, "ok": true}`` or
``{"id": 1, "ok": false, "error": "..."}``. The first line a worker prints is
``{"ready": true, "voices": [...]}`` once its model is loaded, so the server knows when to send.
Anything else a library prints goes to stderr, never stdout.
"""

import json
import os
import sys
import traceback
from typing import Callable, TypedDict

import numpy as np
import soundfile as sf

# keep stdout for the protocol: libraries that print would otherwise corrupt it
_protocol = os.fdopen(os.dup(sys.stdout.fileno()), "w", buffering=1)
os.dup2(sys.stderr.fileno(), sys.stdout.fileno())

# a beat of silence on both ends, so a line does not start or stop mid-syllable in the browser
PAD_SECONDS = 0.08


class Tune(TypedDict, total=False):
    """How a voice is shaped; every key is optional and leaves the engine's default when absent."""

    speed: float  # 1 is the engine's own pace, 1.2 a fifth faster
    timbre: float  # 1 is the voice as trained; above 1 a smaller throat, below a bigger one
    noise: float  # Vosk: how lively the intonation is
    noise_w: float  # Vosk: how uneven the rhythm is


def retimbre(audio: np.ndarray, factor: float) -> np.ndarray:
    """Plays the audio ``factor`` times faster at the same rate: pitch and formants move together.

    The engine is asked to speak ``factor`` times slower beforehand, so the pace comes out unchanged.
    """
    if abs(factor - 1) < 1e-3 or audio.size < 2:
        return audio
    at = np.arange(0, audio.size - 1, factor)
    return np.interp(at, np.arange(audio.size), audio).astype(np.float32)


def write_mp3(path: str, audio: np.ndarray, rate: int) -> None:
    """Writes mono float audio to ``path`` as MP3, peak-normalized so engines sound equally loud."""
    audio = np.asarray(audio, dtype=np.float32).reshape(-1)
    peak = float(np.max(np.abs(audio))) if audio.size else 0.0
    if peak > 0:
        audio = audio * (0.89 / peak)
    pad = np.zeros(int(rate * PAD_SECONDS), dtype=np.float32)
    audio = np.concatenate([pad, audio, pad])
    tmp = f"{path}.part"
    # VBR around 36 kbit/s: speech stays clear, and the app ships some thirty thousand of these
    sf.write(tmp, audio, rate, format="MP3", compression_level=0.85, bitrate_mode="VARIABLE")
    os.replace(tmp, path)


def send(message: dict) -> None:
    _protocol.write(json.dumps(message, ensure_ascii=False) + "\n")


def serve(voices: list[str], synth: Callable[[str, str, str, Tune], None]) -> None:
    """Announces readiness and answers requests until stdin closes."""
    send({"ready": True, "voices": voices})
    for raw in sys.stdin:
        raw = raw.strip()
        if not raw:
            continue
        req = json.loads(raw)
        try:
            synth(req["text"], req.get("voice") or voices[0], req["out"], req.get("tune") or {})
            send({"id": req["id"], "ok": True})
        except Exception as err:  # noqa: BLE001 - one bad line must not take the engine down
            traceback.print_exc(file=sys.stderr)
            send({"id": req["id"], "ok": False, "error": str(err)})
