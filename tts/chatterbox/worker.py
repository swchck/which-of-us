"""Chatterbox Multilingual (MIT): the most natural of the four and by far the heaviest (~3 GB)."""

import os
import sys

import torch

os.environ.setdefault("HF_HOME", os.path.join(os.environ["KTO_TTS_MODELS"], "hf"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from protocol import Tune, serve, write_mp3  # noqa: E402

from chatterbox.mtl_tts import ChatterboxMultilingualTTS  # noqa: E402

# "default" is the model's built-in voice; the others clone a short reference clip if one is there
VOICES = ["default"]
REFS = os.path.join(os.environ["KTO_TTS_MODELS"], "chatterbox-voices")
if os.path.isdir(REFS):
    VOICES += sorted(f[:-4] for f in os.listdir(REFS) if f.endswith(".wav"))

device = "mps" if torch.backends.mps.is_available() else "cpu"
model = ChatterboxMultilingualTTS.from_pretrained(device=device)


def synth(text: str, name: str, out: str, tune: Tune) -> None:
    ref = os.path.join(REFS, f"{name}.wav") if name != "default" else None
    wav = model.generate(text, language_id="ru", audio_prompt_path=ref if ref and os.path.exists(ref) else None)
    write_mp3(out, wav.squeeze(0).cpu().numpy(), model.sr)


serve(VOICES, synth)
