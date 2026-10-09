// Assembles build/tts-runtime: a relocatable Python with the Vosk engine and its model, which the
// desktop app ships so names and answers get a neural voice on a computer with nothing installed.
// It copies the uv-managed Python and the engine's .venv packages, so `uv sync` in tts/vosk comes
// first; nothing is downloaded. Works on macOS and Windows; with CI=true a missing engine
// environment fails the build instead of shipping an app without a voice.
//
//   npm run tts:runtime
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TTS_ENGINES, type TtsEngine } from '../shared/protocol.js';
import { runtimeLaunch } from '../server/tts.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'build', 'tts-runtime');
const win = process.platform === 'win32';
const VOSK_MODEL = 'vosk-model-tts-ru-0.9-multi';

// what each worker imports at startup, so a stripped or incomplete runtime fails here and not on a player's computer
const PROBE: Record<TtsEngine, string> = {
  vosk: "import soundfile, onnxruntime, vosk_tts; assert 'MP3' in soundfile.available_formats()",
};

// `to` is always the final path of the copy, never a directory to copy into
const copy = (from: string, to: string) => {
  // a clone on APFS: the copy takes neither the time nor the disk space
  if (process.platform === 'darwin') execFileSync('cp', ['-cR', from, to]);
  else cpSync(from, to, { recursive: true });
};

function config(venv: string, key: string): string {
  const value = readFileSync(join(venv, 'pyvenv.cfg'), 'utf8').match(new RegExp(`^${key}\\s*=\\s*(.+)$`, 'm'))?.[1]?.trim();
  if (!value) throw new Error(`${venv}/pyvenv.cfg has no ${key}`);
  return value;
}

// `home` is the directory of the base interpreter: the Python root on Windows, its bin/ elsewhere.
// Resolved because uv names it through a symlink, and the copy must be a real tree we may strip.
function pythonRoot(venv: string): string {
  const home = realpathSync(config(venv, 'home'));
  return existsSync(join(home, 'python.exe')) ? home : dirname(home);
}

function stripped(version: string): string[] {
  const stdlib = ['test', 'idlelib', 'tkinter', 'turtledemo', 'ensurepip', 'site-packages'];
  // what an engine that only reads stdin and writes MP3s never touches: the GUI toolkit, tests, pip
  if (win) return ['include', 'libs', 'tcl', 'Scripts', 'pythonw.exe', 'DLLs/_tkinter.pyd', 'DLLs/tcl86t.dll', 'DLLs/tk86t.dll', ...stdlib.map((d) => `Lib/${d}`)];
  return ['include', 'share', 'lib/tcl9.0', 'lib/tk9.0', 'lib/libtcl9.0.dylib', 'lib/libtcl9tk9.0.dylib', ...[...stdlib, `config-${version.slice('python'.length)}-darwin`].map((d) => `lib/${version}/${d}`)];
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const venvs = TTS_ENGINES.map((e) => ({ engine: e, venv: join(root, 'tts', e, '.venv') })).filter((v) => existsSync(v.venv));
if (!(process.platform === 'darwin' || win) || venvs.length === 0) {
  const message = 'no engine environment to ship: the app will narrate names with the system voice';
  if (process.env.CI === 'true') {
    console.error(`${message}; refusing to build without it (run \`uv sync --frozen\` in tts/vosk first)`);
    process.exit(1);
  }
  console.log(message);
  process.exit(0);
}

const python = pythonRoot(venvs[0]!.venv);
const version = `python${config(venvs[0]!.venv, 'version_info').split('.').slice(0, 2).join('.')}`;
for (const { engine, venv } of venvs) {
  if (pythonRoot(venv) !== python) throw new Error(`${engine} runs on another Python than ${venvs[0]!.engine}`);
}
const model = join(root, 'tts', 'models', 'vosk', VOSK_MODEL);
if (venvs.some((v) => v.engine === 'vosk') && !existsSync(model)) throw new Error(`the Vosk model is missing: node scripts/fetch-vosk-model.mjs puts it in ${model}`);

copy(python, join(out, 'python'));
for (const p of stripped(version)) rmSync(join(out, 'python', p), { recursive: true, force: true });
if (!win) {
  const bin = join(out, 'python', 'bin');
  for (const name of readdirSync(bin)) if (name !== version) rmSync(join(bin, name));
}
copy(join(root, 'tts', 'protocol.py'), join(out, 'protocol.py'));
mkdirSync(join(out, 'models'), { recursive: true });

for (const { engine, venv } of venvs) {
  mkdirSync(join(out, engine), { recursive: true });
  copy(win ? join(venv, 'Lib', 'site-packages') : join(venv, 'lib', version, 'site-packages'), join(out, engine, 'site-packages'));
  copy(join(root, 'tts', engine, 'worker.py'), join(out, engine, 'worker.py'));
  mkdirSync(join(out, 'models', engine), { recursive: true });
}
if (venvs.some((v) => v.engine === 'vosk')) copy(model, join(out, 'models', 'vosk', VOSK_MODEL));

for (const { engine } of venvs) {
  const launch = runtimeLaunch(out, engine);
  if (!launch) throw new Error(`${engine}: the assembled runtime has no interpreter or worker`);
  execFileSync(launch.command, ['-c', PROBE[engine]], { cwd: launch.cwd, env: { ...process.env, ...launch.env }, stdio: 'inherit' });
}
console.log(`${venvs.map((v) => v.engine).join(' and ')} runtime with ${version} in build/tts-runtime`);
