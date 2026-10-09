# Backlog: 20 rounds

Each round ships, passes `npm run check` and the UI tests, and lands as its own commit.
Ideas come from a survey of Jackbox 1–11, Gartic Phone, Kahoot, Wavelength, Ito, Just One,
So Clover, Dixit, Monikers, «Шляпа», «Контакт», «Мемология» and Monster Seeking Monster.
Most rounds also carry one active game: phones as joysticks, motion sensors or rhythm taps, so the
evening keeps people moving between the talking and drawing games.

| # | Round | What |
|---|-------|------|
| 1 | Narrator voices | Piper, Silero, Vosk, Chatterbox next to the system voice; per-sentence cache; prebuilt fixed lines |
| 2 | Messenger + «Заговор» | phone chat with contacts and private threads; conspirators push a target into a secret action |
| 3 | «Свидание вслепую» | nights of capped messages, secret constraints, mutual picks score hearts |
| 4 | Secret missions | a hidden objective per player across the whole party, checked by game events, revealed at the end |
| 5 | «Маскарад», «Сарафанное радио» | an anonymous group chat under animal masks, then match people to masks; rumours retold from memory along parallel chains, then vote for the funniest final version |
| 6 | «Без стёрки», «Рынок слухов» | urgent replies typed live with no way to erase, then a vote; clues that rule answers out, traded in private chat, first right versions earn a bonus |
| 7 | «Волна», «По порядку», «Замри!» | done: Wavelength spectrum guess; Ito ordering by secret numbers; dance a finger on the screen while the music plays, keep it off when it stops (touch, since LAN phones get no motion sensors over http) |
| 8 | «Чужак в стае», «Поровну», «Сумо на льдине» | done: odd one out by written answers; prompts that split the room 50/50; arena joysticks with momentum: bump others off a shrinking ice floe, last one standing wins |
| 9 | «Сколько процентов?», «Словарь выдумок», «Бублик говорит» | done: guess the room's own poll result; fake definitions of rare words; Simon says with phone poses: up, face down, spin, shake; commands without the magic words are traps |
| 10 | «Подбери реплику», «Что у меня на лбу?», «Перетягивание каната» | done: phrase cards for a situation; everyone hints, one guesses; two teams tap in rhythm, the rope on the TV moves by the difference |
| 11 | «Шляпа», «Захват» | done: three rounds over the same words: explain, one word, gestures; arena joysticks paint the floor in your colour; the most area after 40 s wins |
| 12 | «Мафия-ТВ» | done: wolves in the village with the TV as narrator |
| 13 | «Четырёхлистник», «Ровно один», «Шейкер» | done: So Clover pairs; Just One with duplicate clues cancelled; shake to inflate your balloon; the biggest one wins, a popped one scores nothing |
| 14 | «Викторина на выбывание», «В каком году?», «Квач» | done: speed trivia with lives; timeline guesses; arena tag: one hunter, a touch passes the role, points for every second not being it |
| 15 | «Сказочник», «Срисуй по памяти» | done: Dixit over the party's own drawings; redraw a picture from memory |
| 16 | «Рифмач», «Барахолка», «Фруктовый ниндзя» | done: couplets performed by the narrator voice; pitch and bid on junk; fruit flies across the TV in each player's lane, slice it with swipes, bombs cost points |
| 17 | «Расследование» | done: a family-safe whodunit built from the players' own survey answers |
| 18 | «Контакт», «Оркестр» | done: the Russian word-contact game; tap your instrument part to the beat |
| 19 | Meta I | done: round modifiers (double points in the last round, blitz timers, a boost for the bottom half); the audience also votes in galleries and answer votes, with an audience favourite on the reveal |
| 20 | Meta II | done: eleven achievements and lifetime stats kept on each phone (parties, wins, points, titles, games tried), shown on the final screen; team mode was done earlier |

## Done outside the rounds

- Points grow with agreement; three jokers each, a unanimous vote earns one more.
- Best moments at the final and in the phone album.
- Team mode, and a shared score for a game of two.
- Active games: «Сумо на льдине», «Квач», «Перетягивание каната» (taken out of rounds 8, 10 and 14).
- The desktop app ships the prebuilt narration of every voice and Piper itself, so names and answers
  get a neural voice on a Mac with nothing installed; Chatterbox says names between cached pieces.

- From the «Это ты!» reference: the narrator reacts to jokers, a pair getting closer or further
  apart, a new leader, a tie at the top, the halfway mark, a close last round and a far last place;
  the mini-game «Вставь слово»; the place «Загадочный особняк»; a few hundred more questions.

## Open questions

- **A «Chatterbox» edition of the desktop app?** A second, heavier download that also ships
  Chatterbox: its model is about 3 GB and its Python with PyTorch about 1 GB more, so the DMG would
  grow to 5–6 GB and the model needs 4–6 GB of RAM once loaded. The text around names is prebuilt,
  so during a party it only has to say each player's name once, in the lobby, which takes seconds
  even on a laptop. Open: is the livelier voice worth a download ten times the size, and does it
  stay responsive on 8 GB Macs while the TV page runs.
  Status 2026-10-07: Chatterbox is in the catalog as «Борис», the best-sounding voice; its full
  prebuild (~a week of rendering) waits until the Артём / Соня / Ирина DMG ships.
  Status 2026-10-09: postponed. The game ships Артём and the system voice only; Борис left the
  catalog, and its engine code stays in tts/chatterbox for the edition below. 814 of ~63 000
  lines were rendered before the pause.
- **«Борис» with names from a list, not typed.** With Борис picked, players choose their name from
  about ten fixed funny names instead of typing one. Every line with every such name is then
  rendered ahead of time, so the best voice never renders anything live and never stitches a name
  between pieces. Costs the fun of inventing a name; needs a picker on the phone in place of the
  text field, and names unique within a room (ten names cap the party at ten). Taken further: a
  separate edition with Борис only and only the fixed names. Size check first: ~4 400 sentences
  with a name × 10 names ≈ 44 000 more renders on top of the ~63 000 fixed ones, about another week
  of Chatterbox time and roughly +0.4 GB of Opus.
  Leaning yes (2026-10-07): a separate «Борис» edition, Борис only, fixed names, and no stress
  marks in its text — the model is trained on plain text and marks would only confuse it.
- **Stress marks for the voices that read them.** Vosk reads «з+амок» vs «зам+ок» (a word with `+`
  skips its dictionary and goes through its own letter-to-sound rules), and gets most words right
  without help; it slips on homographs (замок, мука, атлас), rare words, names and titles.
  Checked 2026-10-07 on the phonemes each engine produces:
  - Vosk takes `+` before the stressed vowel («з+амок» → a1, «зам+ок» → o1); a combining acute
    (U+0301) becomes a phoneme it does not know.
  - Piper takes the combining acute after the vowel («за́мок» → zˈɑmʌk, «замо́к» → zamˈok,
    «мука́», «атла́с» likewise); a `+` it reads out loud, «зэ плюс амок».
  Plan: one stress dictionary, written out per engine in speech text (`+` for Vosk, U+0301 for
  Piper, nothing for Chatterbox), plus a scan of all sentences for known homographs to review by
  ear. Every marked sentence is a new cache key, so it means re-rendering just those sentences,
  as a separate pass later.

## Phone features

Decided 2026-10-09. Phones join over plain http on the LAN, which is not a secure context, so most
device APIs either work over http or need the HTTPS mode with its self-signed certificate.

- In work: the screen stays on during a party (Wake Lock, or a muted looping video over http);
  a light haptic on taps on iPhone (Safari 18+, via the native switch input); vibration on game
  events on Android; a «Вибрация» toggle on the phone.
- Next: sound from the phone itself. Secret cues heard by one player only («Мафия-ТВ», «Чужак в
  стае»), a «your turn» chime, and each player's instrument coming out of their own phone in
  «Оркестр».
- To try, and drop if it doesn't work out: the microphone in HTTPS mode, for one or two active
  games scored on loudness only (shout, blow up a balloon, keep quiet). Nothing is recorded or sent.
- Backlog: a PWA with «Установить приложение». Installing needs HTTPS with a real certificate, and
  the LAN address changes from one evening to the next, so it only fits the hosted version.
- Not planned: compass pointing, torch, NFC, Bluetooth, speech recognition (Android-only, need
  HTTPS or the network, or unreliable in a noisy room).

## Borrowed from «That's You!»

What we already have from it: «who of us» votes, guessing a friend's answer, selfies drawn over,
a spotlight round per player, the company's own questions. Worth taking next:

- **Jokers.** Three per player; play one on an answer you are sure the room shares, double points.
- **The bigger the agreement, the more it pays.** A vote matched by four people is worth more
  than one matched by two, instead of a flat 100 to everyone on the leader.
- **Picture answers.** «What does Аня do when the alarm rings?» with four drawn scenes to choose from.
- **Face copy.** The TV shows a grimace, everyone copies it on the phone camera, the room votes.
- **Selfie relay finale.** Everyone's selfie passes around the circle, each adds something to every face.
- **Two-player co-op.** With two people the score is shared and every question is about the partner.
- **Places:** «Квест-комната» (law and order without a prison), «Арт-студия» (creativity),
  «Семейный альбом» (family photos through the years).
