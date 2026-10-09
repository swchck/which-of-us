import type { ReactNode } from 'react';
import { Donut } from '@/components/Donut';
import { PhoneFrame, TvFrame } from '@/components/Frames';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CREDITS, FAQ, GALLERY, GAME_TABS, DOWNLOADS, LICENSES_URL, REPO, STEPS, gameById } from './content';
import generated from './generated.json';
import { num, plural } from './lib/format';
import { firstScreen, hasScreen, screenUrl } from './lib/screens';

const gamesCount = generated.games.length;
const placesCount = generated.places.length;
const questionsRounded = Math.floor(generated.questions / 100) * 100;

function Section({ id, title, lead, children }: { id: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mb-10 text-center">
        <h2 id={`${id}-title`} className="font-display text-3xl leading-tight [text-shadow:0_4px_0_var(--ink)] sm:text-5xl">
          {title}
        </h2>
        {lead && <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{lead}</p>}
      </div>
      {children}
    </section>
  );
}

// the visitor's own system goes first and gets the loud button
const onWindows = typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent);
const downloads = onWindows ? [...DOWNLOADS].reverse() : DOWNLOADS;

function DownloadButtons() {
  return downloads.map((d, i) => (
    <Button key={d.os} asChild variant={i === 0 ? 'pink' : 'ghost'} className="sm:whitespace-nowrap">
      <a href={d.href} download>
        {d.label}
      </a>
    </Button>
  ));
}

function Header() {
  const links = [
    ['#inside', 'Что внутри'],
    ['#screens', 'Скриншоты'],
    ['#download', 'Скачать'],
    ['#faq', 'Вопросы'],
  ];
  return (
    <header className="sticky top-0 z-40 border-b-4 border-ink bg-violet/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <a href="#top" className="font-display text-xl text-yellow [text-shadow:0_3px_0_var(--ink)]">
          Кто из нас?
        </a>
        <nav aria-label="Разделы" className="hidden gap-1 md:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="rounded-xl px-3 py-2 font-bold text-white no-underline hover:bg-white/10">
              {label}
            </a>
          ))}
        </nav>
        <Button asChild size="sm">
          <a href="#download">Скачать</a>
        </Button>
      </div>
    </header>
  );
}

function Hero() {
  const tv = firstScreen('tv-home', 'tv-question', 'tv-lobby');
  const phone = firstScreen('phone-vote', 'phone-lobby', 'phone-join');
  return (
    <div id="top" className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-10 px-4 pb-10 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="text-center lg:text-left">
        <Badge variant="cyan" className="mb-6">
          Бесплатно · открытый код · от 2 до 8 игроков
        </Badge>
        <h1 className="-rotate-2 text-5xl sm:text-7xl">
          <span className="logo-word text-yellow">Кто</span> <span className="logo-word text-white">из нас?</span>
        </h1>
        <p className="mt-10 text-xl sm:text-2xl">
          Вечеринка-игра для компании. ТВ показывает игру, гости играют с телефонов в браузере. Приложения гостям не нужны.
        </p>
        <p className="hand mt-3 text-muted-foreground">Вопросы про вас, рисунки, погони и немного вранья.</p>
        <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
          <DownloadButtons />
        </div>
        <p className="mt-5 text-center lg:text-left">
          <a href={REPO} className="font-bold text-yellow underline underline-offset-4">
            Исходный код на GitHub
          </a>
        </p>
      </div>
      <div className="relative mx-auto w-full max-w-xl">
        {tv ? (
          <>
            <TvFrame name={tv} alt="Экран игры на телевизоре" eager className="sticker-tilt-r" />
            {phone && (
              <PhoneFrame
                name={phone}
                alt="Игра на телефоне"
                eager
                className="absolute -bottom-6 -left-2 w-[28%] sticker-tilt-l sm:-left-8"
              />
            )}
          </>
        ) : (
          <Donut className="mx-auto w-64 motion-safe:animate-[bob_4s_ease-in-out_infinite] sm:w-80" />
        )}
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <Section id="how" title="Как это работает" lead="Три шага, и вы играете. Роутер и регистрация не нужны.">
      <ol className="m-0 grid list-none gap-8 p-0 md:grid-cols-3">
        {STEPS.map((step, i) => {
          const shot = firstScreen(...step.shot);
          const isPhone = shot?.startsWith('phone');
          return (
            <li key={step.title}>
              <Card className={`h-full ${i % 2 ? 'sticker-tilt-r' : 'sticker-tilt-l'} motion-reduce:transform-none`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="grid size-12 shrink-0 place-items-center rounded-full border-4 border-ink bg-yellow font-display text-2xl shadow-sticker-sm"
                    >
                      {i + 1}
                    </span>
                    <CardTitle>{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="m-0">{step.text}</p>
                  {shot &&
                    (isPhone ? (
                      <PhoneFrame name={shot} alt={step.alt} className="mx-auto mt-5 w-40" />
                    ) : (
                      <TvFrame name={shot} alt={step.alt} className="mx-auto mt-5" />
                    ))}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

function Inside() {
  const features: { icon: string; title: string; text: string }[] = [
    {
      icon: '🗳️',
      title: 'Вопросы «Кто из нас?»',
      text: `Более ${num(questionsRounded)} вопросов в ${generated.packs} наборах: для всех, семейный, «Что если», ко дню рождения и острый 18+. Есть вопросы про всю компанию, «Угадай ответ» и «Шкала» про одного игрока.`,
    },
    {
      icon: '🎲',
      title: `${gamesCount} ${plural(gamesCount, ['мини-игра', 'мини-игры', 'мини-игр'])}`,
      text: 'Между вопросами идут короткие игры: на знание друзей, слова, обман, рисование и движение. Перед первой игрой каждого вида показывается карточка с правилами.',
    },
    {
      icon: '🕹️',
      title: 'Активные игры',
      text: 'Телефон становится джойстиком, а в «Звездопаде», «Сумо на льдине», «Квач» и «Перетягивании каната» шарики с селфи игроков носятся по арене на ТВ. С HTTPS игры слушаются наклона и тряски.',
    },
    {
      icon: '🎨',
      title: 'Рисование',
      text: 'Рисуют пальцем: дорисовывают селфи друга, играют в «Крокодила», рисуют по описанию и по памяти.',
    },
    {
      icon: '🌍',
      title: `${placesCount} ${plural(placesCount, ['место', 'места', 'мест'])} и сцены`,
      text: 'От джунглей и космоса до поликлиники и застолья у родни. У каждого места своя анимированная сцена, музыка и свои вопросы. Игра помнит, что было в прошлые вечера, и сначала берёт новое.',
    },
    {
      icon: '🎙️',
      title: 'Голос Артёма',
      text: 'Ведущий Бублик озвучивает реплики нейроголосом. Он работает на компьютере без интернета, а в приложении уже лежит всё готовое. Есть и системный голос.',
    },
    {
      icon: '🏆',
      title: 'Достижения и награды',
      text: 'Игроки копят достижения и статистику прямо на своём телефоне и видят их на финальном экране. В конце вечера ведущий вспоминает лучшие моменты.',
    },
    {
      icon: '🤝',
      title: 'Команды и боты',
      text: 'Режим команд для компании побольше. Вдвоём играйте с ботами, а вечером с другом общий счёт на двоих.',
    },
    {
      icon: '✏️',
      title: 'Свои вопросы',
      text: 'Редактор в лобби: добавьте свои вопросы трёх видов («Кто из нас?», «Угадай ответ», «Шкала») и одной кнопкой включите их в партию. Имя героя вставляется как {имя}.',
    },
    {
      icon: '⭐',
      title: 'Раунд-звезда',
      text: 'Бублик выбирает одного игрока и представляет его в теме места: «Отправляемся в джунгли! Наш проводник сегодня — Аня…». Все вопросы раунда только про него: он отвечает, остальные угадывают.',
    },
    {
      icon: '📸',
      title: 'Зрители и альбом',
      text: 'Кто пришёл, когда игра уже идёт, становится зрителем и голосует без очков. В конце на телефонах появляется альбом вечеринки: лучшие рисунки и фото сохраняются в PNG одной кнопкой.',
    },
    {
      icon: '🌐',
      title: 'Игра через интернет',
      text: 'Гости в разных городах? Включите «Через интернет», и телефоны зайдут по постоянному HTTPS-адресу через небольшой релей на Cloudflare. Игра при этом остаётся на вашем компьютере.',
    },
  ];
  return (
    <Section id="inside" title="Что внутри" lead="Партия идёт раундами: вопросы про компанию, мини-игры между ними и «раунд-звезда» про одного игрока.">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <span aria-hidden className="text-4xl leading-none">
                {f.icon}
              </span>
              <CardTitle>{f.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="m-0 text-base">{f.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h3 className="mb-6 mt-16 text-center font-display text-2xl sm:text-3xl">Мини-игры на любой вкус</h3>
      <Tabs defaultValue={GAME_TABS[0].id}>
        <TabsList aria-label="Виды мини-игр">
          {GAME_TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {GAME_TABS.map((t) => (
          <TabsContent key={t.id} value={t.id}>
            <p className="mx-auto mb-6 max-w-2xl text-center text-muted-foreground">{t.lead}</p>
            <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {t.games.map((id) => gameById.get(id)).filter((g) => g !== undefined).map((g) => (
                <li key={g.id}>
                  <Card className="h-full shadow-sticker-sm">
                    <div className="flex items-start gap-3 p-4">
                      <span aria-hidden className="text-3xl leading-none">
                        {g.icon}
                      </span>
                      <div>
                        <h4 className="m-0 font-display text-base leading-tight">{g.title}</h4>
                        <p className="m-0 mt-1 text-sm leading-snug">{g.pitch}</p>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
      <p className="mt-8 text-center text-muted-foreground">Это только часть: всего в игре {gamesCount} {plural(gamesCount, ['мини-игра', 'мини-игры', 'мини-игр'])}.</p>
    </Section>
  );
}

function ShotButton({ shot }: { shot: (typeof GALLERY)[number] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" aria-label={`Увеличить: ${shot.caption}`} className="block w-full cursor-zoom-in rounded-[22px] border-0 bg-transparent p-0 text-left">
          {shot.kind === 'tv' ? (
            <TvFrame name={shot.name} alt={shot.caption} />
          ) : (
            <PhoneFrame name={shot.name} alt={shot.caption} className="mx-auto max-w-48" />
          )}
        </button>
      </DialogTrigger>
      <p className="hand m-0 mt-3 text-center text-base">{shot.caption}</p>
      <DialogContent className={shot.kind === 'tv' ? '' : 'max-w-sm'}>
        <DialogTitle className="mb-3 pr-14 font-display text-xl">{shot.caption}</DialogTitle>
        <DialogDescription className="sr-only">Скриншот в полном размере</DialogDescription>
        <img src={screenUrl(shot.name)} alt={shot.caption} className="block w-full rounded-xl border-4 border-ink" />
      </DialogContent>
    </Dialog>
  );
}

function Gallery() {
  const shots = GALLERY.filter((s) => hasScreen(s.name));
  return (
    <Section id="screens" title="Как это выглядит" lead={shots.length > 0 ? "Нажмите на картинку, чтобы рассмотреть её крупнее." : undefined}>
      {shots.length === 0 ? (
        <Card className="mx-auto max-w-xl">
          <CardContent className="pt-6 text-center">Скриншоты скоро появятся. Пока что их можно посмотреть в самой игре.</CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-14">
          {(['tv', 'phone'] as const).map((kind) => {
            const group = shots.filter((s) => s.kind === kind);
            if (group.length === 0) return null;
            return (
              <div key={kind}>
                <h3 className="mb-6 text-center font-display text-2xl">{kind === 'tv' ? 'На экране ТВ' : 'На телефоне'}</h3>
                <ul
                  className={`m-0 grid list-none gap-x-6 gap-y-10 p-0 ${kind === 'tv' ? 'sm:grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}
                >
                  {group.map((s) => (
                    <li key={s.name}>
                      <ShotButton shot={s} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-yellow text-sm font-bold">
            {i + 1}
          </span>
          <span className="text-base">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="m-0 overflow-x-auto rounded-xl border-[3px] border-ink bg-ink p-3 text-sm text-yellow">
      <code>{children}</code>
    </pre>
  );
}

function Download() {
  return (
    <Section
      id="download"
      title="Скачать и установить"
      lead="Готовое приложение запускается двойным кликом, без терминала и Node.js. Оно само поднимает игровой сервер и открывает экран ТВ."
    >
      <div className="mb-8 flex flex-col items-stretch gap-4 sm:flex-row sm:justify-center">
        <DownloadButtons />
      </div>
      <Card className="mb-6">
        <CardContent className="pt-5 text-center text-base">
          <strong>Сборки не подписаны сертификатами</strong>, поэтому система предупредит при первом запуске. Это нормально: ниже написано, что нажать.
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>macOS</CardTitle>
            <div>
              <Badge variant="paper">.dmg</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Steps
              items={[
                'Откройте .dmg и перетащите «Кто из нас» в «Программы».',
                'Запустите приложение: macOS остановит первый запуск.',
                <>Откройте «Системные настройки» → «Конфиденциальность и безопасность», внизу нажмите <strong>«Всё равно открыть»</strong> и подтвердите.</>,
                <>Когда macOS спросит про входящие подключения, нажмите <strong>«Разрешить»</strong>, иначе телефоны не подключатся.</>,
              ]}
            />
            <p className="mb-0 mt-4 text-sm">Сборка для Mac с Apple Silicon (M1 и новее), Mac с Intel не поддерживаются. Нейроголос Артёма работает сразу, без установки.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Windows</CardTitle>
            <div>
              <Badge variant="paper">.exe</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Steps
              items={[
                'Запустите установщик .exe.',
                <>SmartScreen предупредит о неизвестном издателе: нажмите <strong>«Подробнее»</strong>, затем <strong>«Выполнить в любом случае»</strong>.</>,
                'Установщик попросит права администратора: он ставит игру в Program Files и открывает ей порт в брандмауэре для устройств локальной сети. При удалении правило убирается.',
              ]}
            />
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Запуск из исходников</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mt-0 text-base">Нужен Node.js 22.12 или новее.</p>
          <Code>{`git clone ${REPO}.git\ncd which-of-us\nnpm install\nnpm start`}</Code>
          <p className="mb-0 mt-3 text-base">
            Команда <code>npm start</code> соберёт игру и запустит сервер. В терминале появятся адрес для ТВ и QR-код для телефонов. Телефоны должны быть в той же сети Wi-Fi, что и компьютер.
          </p>
        </CardContent>
      </Card>
    </Section>
  );
}

function Faq() {
  return (
    <Section id="faq" title="Частые вопросы">
      <Accordion type="single" collapsible className="mx-auto max-w-3xl">
        {FAQ.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>
              <p className="m-0 text-base">{item.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="mt-10 border-t-4 border-ink bg-ink/70">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2">
        <div>
          <p className="m-0 font-display text-xl text-yellow">Кто из нас?</p>
          <p className="mt-3 text-base">
            Код и контент игры под лицензией{' '}
            <a href={`${REPO}/blob/master/LICENSE`} className="font-bold text-yellow underline underline-offset-4">
              GPL-3.0
            </a>
            . Шрифты, эмодзи, звуки и голос идут под своими лицензиями.
          </p>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-base">
            <a href={REPO} className="font-bold text-yellow underline underline-offset-4">
              Исходный код
            </a>
            <a href="#download" className="font-bold text-yellow underline underline-offset-4">
              Скачать
            </a>
            <a href={`${REPO}/issues`} className="font-bold text-yellow underline underline-offset-4">
              Сообщить об ошибке
            </a>
          </p>
        </div>
        <div>
          <h2 className="m-0 font-display text-lg">Сделано с помощью</h2>
          <ul className="mt-3 list-none space-y-1 p-0 text-base">
            {CREDITS.map((c) => (
              <li key={c.name}>
                {c.name} <span className="text-muted-foreground">({c.what}, {c.license})</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-base">
            <a href={LICENSES_URL} className="font-bold text-yellow underline underline-offset-4">
              Полные тексты лицензий
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export function App() {
  return (
    <>
      <a
        href="#how"
        className="fixed left-3 top-3 z-50 -translate-y-20 rounded-xl border-4 border-ink bg-yellow px-4 py-2 font-bold text-ink focus:translate-y-0"
      >
        К содержанию
      </a>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Inside />
        <Gallery />
        <Download />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
