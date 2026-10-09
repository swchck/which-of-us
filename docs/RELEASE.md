# Подпись и автообновление

Сейчас приложение собирается без подписи. Поэтому macOS просит «правый клик → Открыть»,
а Windows SmartScreen предупреждает о неизвестном издателе. Ниже описано, что нужно завести
и что поменять в проекте. Каждый шаг требует ваших аккаунтов или ключей, поэтому в репозитории
пока ничего не включено.

## 1. macOS: подпись и нотаризация

**Что нужно от вас:**

- Аккаунт [Apple Developer Program](https://developer.apple.com/programs/) (99 $ в год).
- Сертификат **Developer ID Application**. Его выпускают в Xcode → Settings → Accounts →
  Manage Certificates → «+». Затем экспортируйте его из «Связки ключей» в `.p12` с паролем.
- Для нотаризации — пароль приложения. Его создают на [appleid.apple.com](https://appleid.apple.com)
  → «Пароли приложений». Также нужен Team ID из кабинета разработчика.

**Что поменять в проекте.** Сервер-сайдкар — это Node (V8 с JIT). С hardened runtime, которого
требует нотаризация, он не запустится без разрешений на JIT. Поэтому:

1. Создайте `desktop/src-tauri/entitlements.plist`:

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
     <key>com.apple.security.cs.allow-jit</key><true/>
     <key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/>
   </dict>
   </plist>
   ```

2. В `tauri.conf.json`, в `bundle.macOS`, добавьте `"entitlements": "entitlements.plist"` и уберите
   `"signingIdentity": "-"` и `"hardenedRuntime": false`. Без сертификата сборка подписывается
   «ad hoc»: так macOS принимает скачанную копию за целую, а не за повреждённую, но всё равно
   спрашивает разрешения при первом запуске.

3. Перед сборкой задайте переменные окружения. Tauri сам подпишет приложение и сайдкар,
   отправит сборку на нотаризацию и «пришьёт» тикет:

   | Переменная | Значение |
   | --- | --- |
   | `APPLE_CERTIFICATE` | содержимое `.p12` в base64 (`base64 -i cert.p12`) |
   | `APPLE_CERTIFICATE_PASSWORD` | пароль от `.p12` |
   | `APPLE_SIGNING_IDENTITY` | `Developer ID Application: Имя (TEAMID)` |
   | `APPLE_ID` | e-mail Apple ID |
   | `APPLE_PASSWORD` | пароль приложения |
   | `APPLE_TEAM_ID` | Team ID |

Проверка: `spctl -a -vv "/Applications/Кто из нас.app"` должен ответить `accepted, source=Notarized Developer ID`.

## 2. Windows: подпись установщика

**Что нужно от вас.** Подойдёт один из вариантов:

- **Azure Trusted Signing** — около 10 $ в месяц, без токенов. Нужна организация или ИП с историей.
- Сертификат **OV или EV Code Signing** от удостоверяющего центра (Sectigo, DigiCert и др.).
  С 2023 года такие сертификаты выдают только на аппаратном токене или в облачном HSM.
  EV сразу снимает предупреждение SmartScreen. OV набирает репутацию со временем.

**Что поменять в проекте.** Укажите в `tauri.conf.json` → `bundle.windows` одно из двух:

- `"certificateThumbprint": "<отпечаток>"` — если сертификат установлен в хранилище машины,
  где идёт сборка. Также добавьте `"timestampUrl": "http://timestamp.digicert.com"`.
- `"signCommand": "..."` — команда внешней подписи (например, `trusted-signing-cli` для Azure).

## 3. Автообновление

Для автообновления используется официальный плагин Tauri `updater`. Приложение при запуске
скачивает манифест `latest.json`, сверяет подпись обновления и предлагает установить его.

**Что нужно от вас:**

- Пара ключей обновлений. Её генерируют один раз и хранят вечно: потеряете приватный ключ —
  старые установки больше не смогут обновиться.

  ```bash
  npx tauri signer generate -w ~/.tauri/kto-iz-nas.key
  ```

- Место, откуда раздавать обновления. Проще всего — GitHub Releases публичного репозитория.
  Нужен его адрес вида `github.com/<user>/<repo>`.

**Что поменять в проекте:**

1. Подключите плагин:
   - `cargo add tauri-plugin-updater tauri-plugin-process` в `desktop/src-tauri`;
   - `npm i @tauri-apps/plugin-updater @tauri-apps/plugin-process`.
2. Зарегистрируйте плагины в `lib.rs`: `.plugin(tauri_plugin_updater::Builder::new().build())`
   и `.plugin(tauri_plugin_process::init())`. В `capabilities/default.json` добавьте права
   `updater:default` и `process:allow-restart`.
3. В `tauri.conf.json`:

   ```json
   "bundle": { "createUpdaterArtifacts": true },
   "plugins": {
     "updater": {
       "pubkey": "<содержимое ~/.tauri/kto-iz-nas.key.pub>",
       "endpoints": ["https://github.com/<user>/<repo>/releases/latest/download/latest.json"]
     }
   }
   ```

4. На экране-заставке (`desktop/splash`) вызовите `check()` из `@tauri-apps/plugin-updater`.
   Если есть обновление — покажите кнопку «Обновить», затем `downloadAndInstall()` и `relaunch()`.
5. При сборке задайте `TAURI_SIGNING_PRIVATE_KEY` (содержимое ключа) и
   `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.

## 4. CI

Workflow `.github/workflows/desktop.yml` уже собирает `.dmg` и `.exe`. Когда секреты
появятся, сделайте следующее:

1. Добавьте секреты из таблиц выше в Settings → Secrets and variables → Actions.
2. Передайте их в шаг `npm run desktop:build` через `env:`.

   Делайте это только после того, как секреты созданы. Пустая `APPLE_CERTIFICATE` ломает сборку:
   Tauri пытается импортировать пустой сертификат.

3. Для автообновления замените шаг сборки на `tauri-apps/tauri-action`. Он сам создаст релиз
   по тегу `v*`, загрузит установщики и сгенерирует `latest.json`.

## Что прислать, чтобы всё включить

- Адрес публичного репозитория (для `endpoints` и релизов).
- Решение по Apple Developer Program и по сертификату для Windows: заводите или пока без подписи.

Сами ключи и пароли присылать не нужно. Вы кладёте их в секреты GitHub, а я пропишу конфигурацию
и код проверки обновлений.
