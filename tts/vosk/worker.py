"""Vosk-TTS Russian multi-speaker model, read from KTO_TTS_MODELS/vosk; downloads itself when missing there."""

import os
import re
import sys
import tempfile

import soundfile as sf

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from protocol import Tune, retimbre, serve, write_mp3  # noqa: E402

import onnxruntime  # noqa: E402
from vosk_tts import Model, Synth  # noqa: E402

# vosk_tts gives every session all cores, which several prebuild workers side by side oversubscribe;
# KTO_TTS_THREADS caps them, and vosk_tts has no option for it, hence the swapped SessionOptions
_threads = int(os.environ.get("KTO_TTS_THREADS", "0"))
if _threads > 0:
    _SessionOptions = onnxruntime.SessionOptions

    def _capped() -> onnxruntime.SessionOptions:
        opts = _SessionOptions()
        opts.intra_op_num_threads = _threads
        return opts

    onnxruntime.SessionOptions = _capped

MODEL = "vosk-model-tts-ru-0.9-multi"
# the 0.9 model has five speakers (0-2 female, 3-4 male); the game uses one of them
VOICES = ["speaker-3"]

models = os.path.join(os.environ["KTO_TTS_MODELS"], "vosk")
os.makedirs(models, exist_ok=True)
os.chdir(models)
local = os.path.join(models, MODEL)
# by name, vosk_tts asks its server for the model list on every start, even with the model on disk
synth_engine = Synth(Model(model_path=local) if os.path.isdir(local) else Model(model_name=MODEL))


# the model knows Cyrillic only and fails on anything else; the narrator's own lines arrive in Russian
# already (speechText), so this rough reading is for what players type, a «Max» or a «Dima»
LATIN = [
    ("sch", "щ"), ("sh", "ш"), ("ch", "ч"), ("zh", "ж"), ("kh", "х"), ("ts", "ц"), ("th", "т"), ("ph", "ф"),
    ("ya", "я"), ("yu", "ю"), ("yo", "ё"), ("ee", "и"), ("oo", "у"), ("ck", "к"), ("qu", "кв"),
    ("a", "а"), ("b", "б"), ("c", "к"), ("d", "д"), ("e", "е"), ("f", "ф"), ("g", "г"), ("h", "х"), ("i", "и"),
    ("j", "дж"), ("k", "к"), ("l", "л"), ("m", "м"), ("n", "н"), ("o", "о"), ("p", "п"), ("q", "к"), ("r", "р"),
    ("s", "с"), ("t", "т"), ("u", "у"), ("v", "в"), ("w", "в"), ("x", "кс"), ("y", "й"), ("z", "з"),
]


def readable(text: str) -> str:
    out, i, low = [], 0, text.lower()
    while i < len(text):
        for latin, cyr in LATIN:
            if low.startswith(latin, i):
                out.append(cyr.capitalize() if text[i].isupper() else cyr)
                i += len(latin)
                break
        else:
            out.append(text[i])
            i += 1
    # digits and stray symbols the model has no phonemes for are dropped rather than failing the line;
    # «+» stays, it marks the stressed vowel of a homograph
    return re.sub(r"[^А-Яа-яЁё\s.,!?:;+-]", " ", "".join(out))


def synth(text: str, name: str, out: str, tune: Tune) -> None:
    text = readable(text)
    speaker = int(name.rsplit("-", 1)[-1]) if name in VOICES else 3
    timbre = tune.get("timbre", 1.0)
    speed = tune.get("speed", 1.0) / timbre
    # a directory rather than NamedTemporaryFile: Windows cannot reopen a temp file that is still open
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "line.wav")
        synth_engine.synth(
            text,
            wav,
            speaker_id=speaker,
            speech_rate=None if speed == 1 else speed,
            noise_level=tune.get("noise"),
            duration_noise_level=tune.get("noise_w"),
        )
        audio, rate = sf.read(wav, dtype="float32")
    write_mp3(out, retimbre(audio, timbre), rate)


serve(VOICES, synth)
