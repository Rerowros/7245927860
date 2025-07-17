// page.tsx
"use client";

import { useState, type SVGProps, FC, ReactNode, useEffect, useMemo } from "react";
import Link from "next/link"; // <-- ДОБАВЛЕНО

import { PurchaseModal } from "@/components/PurchaseModal";
import { useInView } from "react-intersection-observer";

// --- КОНФИГУРАЦИЯ ---
const CONFIG = {
  STAR_EXCHANGE_RATE_RUB: 1.5,
  TOTAL_AVAILABLE_STARS: 50000,
  MIN_STARS: 100,
  MAX_STARS: 5000,
};

// --- Типы ---
type Tier = {
  name: string;
  price: string;
  stars: string;
  description: string;
  isPopular?: boolean;
  isCustom?: boolean;
};

// --- Компонент для анимации при прокрутке ---
const AnimateOnScroll = ({ children, delay = 0 }: { children: ReactNode, delay?: number }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};



// --- Основной компонент страницы ---
export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  const handleBuyClick = (tier: Tier) => {
    setSelectedTier(tier);
    setIsModalOpen(true);
  };
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-black">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PricingSection onBuyClick={handleBuyClick} />
      </main>
      <PurchaseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tier={selectedTier}
      />
    </div>
  );
}

// --- Секции страницы ---

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-lg dark:border-neutral-800/80 dark:bg-black/80">
      <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <nav className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <StarIcon className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Звёзды Telegram
            </span>
          </Link>
          <Link href="/about" className="text-sm font-medium text-blue-600 underline decoration-blue-600/50 underline-offset-4 dark:text-blue-400 dark:decoration-blue-400/50">
            О Звёздах
          </Link>
        </nav>
        <Link
          href="/#pricing"
          className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-black"
        >
          Купить
        </Link>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden py-20 md:py-32">
      <div className="absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10"></div>

      <div className="container mx-auto max-w-5xl px-4 text-center">
        <AnimateOnScroll>
          <div className="mb-6 flex justify-center">
            <div className="relative rounded-full bg-neutral-100 px-4 py-1.5 text-sm leading-6 text-neutral-600 ring-1 ring-inset ring-neutral-900/10 dark:bg-neutral-900 dark:text-neutral-400 dark:ring-white/10">
              <span className="hidden md:inline">Официальная валюта для цифровых товаров в Telegram.</span>
              <a href="#" className="font-semibold text-blue-600 dark:text-blue-400">
                <span className="absolute inset-0" aria-hidden="true" /> Узнать больше <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </AnimateOnScroll>
        <AnimateOnScroll delay={100}>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-6xl">
            Расширьте возможности <br /> вашего Telegram
          </h1>
        </AnimateOnScroll>
        <AnimateOnScroll delay={200}>
          <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400">
            Открывайте премиум-функции, поддерживайте любимых авторов и оплачивайте 
            услуги в ботах и мини-приложениях с помощью Звёзд.
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll delay={300}>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#pricing"
              className="rounded-md bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 glow-effect"
            >
              Получить Звёзды
            </a>
            <a
              href="#"
              className="text-base font-semibold leading-6 text-neutral-900 dark:text-neutral-100"
            >
              Подробнее <span aria-hidden="true">→</span>
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <GiftIcon className="h-6 w-6" />,
      title: "Поддержка авторов",
      description: "Донатьте любимым каналам и вознаграждайте их за качественный контент.",
    },
    {
      icon: <BotIcon className="h-6 w-6" />,
      title: "Оплата в мини-приложениях",
      description: "Платите за цифровые услуги и товары в развивающейся экосистеме Telegram Mini Apps.",
    },
    {
      icon: <ImageIcon className="h-6 w-6" />,
      title: "Покупка цифровых товаров",
      description: "Приобретайте эксклюзивные стикеры, темы оформления и многое другое.",
    },
  ];

  return (
    <section className="bg-neutral-50 py-20 dark:bg-neutral-950 sm:py-24">
      <div className="container mx-auto max-w-5xl px-4">
        <AnimateOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              На что можно потратить Звёзды
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Звёзды открывают вселенную возможностей прямо внутри Telegram.
            </p>
          </div>
        </AnimateOnScroll>
        <div className="mt-16 grid grid-cols-1 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-12">
          {features.map((feature, index) => (
            <AnimateOnScroll key={feature.title} delay={index * 150}>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{feature.title}</h3>
                <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400">{feature.description}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- КОМПОНЕНТ СЛАЙДЕРА С ИСПРАВЛЕННЫМ БАГОМ АНИМАЦИИ ---
const CustomAmountCard: FC<{ onBuyClick: (tier: Tier) => void }> = ({ onBuyClick }) => {
  const [stars, setStars] = useState(CONFIG.MIN_STARS);
  
  // -- ИСПРАВЛЕНИЕ БАГА АНИМАЦИИ --
  // `animatedStars` и `animatedPrice` будут обновляться с задержкой, 
  // чтобы запускать анимацию только когда пользователь перестал двигать слайдер.
  const [animatedStars, setAnimatedStars] = useState(stars);
  const price = (stars * CONFIG.STAR_EXCHANGE_RATE_RUB).toFixed(2);
  const [animatedPrice, setAnimatedPrice] = useState(price);

  useEffect(() => {
    // Создаем таймер, который сработает через 250мс после последнего изменения `stars`
    const handler = setTimeout(() => {
      setAnimatedStars(stars);
      setAnimatedPrice(price);
    }, 250);

    // Очищаем предыдущий таймер при каждом новом изменении.
    // Это и есть суть "debounce" - функция сработает только один раз, в конце.
    return () => {
      clearTimeout(handler);
    };
  }, [stars, price]);
  // ------------------------------

  const handleBuy = () => {
    onBuyClick({
      name: "Особый набор",
      stars: stars.toString(),
      price: `${price} ₽`,
      description: `Покупка ${stars} звёзд по индивидуальному выбору.`,
    });
  };

  const progressPercentage = ((stars - CONFIG.MIN_STARS) / (CONFIG.MAX_STARS - CONFIG.MIN_STARS)) * 100;
  
  const sliderStyle = {
    '--slider-progress': `${progressPercentage}%`,
    '--slider-track-bg-light': '#e5e7eb',
    '--slider-track-bg-dark': '#374151',
    '--slider-accent-color': '#2563eb',
  } as React.CSSProperties;


  return (
    <div className="md:col-span-2 relative flex flex-col rounded-2xl border-2 p-8 shadow-lg transition-all border-blue-500 ring-4 ring-blue-500/20 dark:border-blue-500">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
          Ваш выбор
      </div>
      
      <h3 className="text-lg text-center font-semibold leading-6 text-neutral-900 dark:text-neutral-100">Соберите свой набор</h3>
      <p className="mt-1 text-sm text-center text-neutral-500">Двигайте слайдер, чтобы выбрать количество.</p>
      
      <div className="my-8 flex flex-col items-center justify-center">
        <div className="flex items-end justify-center gap-2">
           <StarIcon className="h-8 w-8 text-yellow-400 mb-1" />
           {/* 
             Ключ `key` теперь зависит от `animatedStars`, а не `stars`.
             Анимация запустится только когда сработает таймер.
             При этом текст {stars} обновляется мгновенно.
           */}
           <span key={animatedStars} className="font-mono text-5xl font-bold text-neutral-800 dark:text-neutral-200 animate-scale-in">
            {stars}
           </span>
        </div>
        <p key={animatedPrice} className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 animate-scale-in">{price} ₽</p>
      </div>

      <div className="w-full group">
        <input
          type="range"
          min={CONFIG.MIN_STARS}
          max={CONFIG.MAX_STARS}
          step="50"
          value={stars}
          onChange={(e) => setStars(Number(e.target.value))}
          style={sliderStyle}
          className={`
            h-3 w-full cursor-pointer appearance-none rounded-full
            bg-gradient-to-r from-[var(--slider-accent-color)] to-[var(--slider-accent-color)]
            bg-[length:var(--slider-progress)_100%] bg-no-repeat 
            [background-position:0_center] 
            bg-[var(--slider-track-bg-light)]
            dark:bg-[var(--slider-track-bg-dark)]
            
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-blue-600/50
            [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:ease-in-out
            group-hover:[&::-webkit-slider-thumb]:ring-blue-600
            
            group-hover:[&::-webkit-slider-thumb]:scale-110
            active:[&::-webkit-slider-thumb]:scale-125
            active:[&::-webkit-slider-thumb]:shadow-blue-500/30
            active:[&::-webkit-slider-thumb]:shadow-2xl

            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-none
            [&::-moz-range-thumb]:shadow-lg
            group-hover:[&::-moz-range-thumb]:ring-2 group-hover:[&::-moz-range-thumb]:ring-blue-600
          `}
        />
        <div className="mt-2 flex justify-between text-xs font-medium text-neutral-500">
          <span>{CONFIG.MIN_STARS}</span>
          <span>{CONFIG.MAX_STARS}</span>
        </div>
      </div>
      
      <button
        onClick={handleBuy}
        className="mt-10 block w-full rounded-md bg-blue-600 px-3 py-3 text-center text-base font-semibold leading-6 text-white shadow-sm transition-all hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 glow-effect"
      >
        Купить {stars} звёзд
      </button>
    </div>
  );
};

// --- НОВЫЙ КОМПОНЕНТ ДЛЯ АНИМИРОВАННОГО ФОНА ---
const AnimatedStarsBackground = () => {
    // useMemo, чтобы массив не создавался заново при каждом рендере
    const stars = useMemo(() => 
      Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="star-particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${Math.random() * 10 + 10}s`, // от 10 до 20 сек
            transform: `scale(${Math.random() * 0.5 + 0.5})` // разный размер
          }}
        />
      )),
    []);
  
    return <div className="absolute inset-0 z-0 overflow-hidden">{stars}</div>;
};


// --- ОБНОВЛЕННАЯ СЕКЦИЯ ЦЕН С АНИМИРОВАННЫМ ФОНОМ ---
function PricingSection({ onBuyClick }: { onBuyClick: (tier: Tier) => void }) {
  const tiers: Tier[] = [
    { name: "Первый", stars: "100", price: `${(100 * CONFIG.STAR_EXCHANGE_RATE_RUB).toFixed(0)} ₽`, description: "Для разгона" },
    { name: "Выбор автора", stars: "500", price: `${(500 * CONFIG.STAR_EXCHANGE_RATE_RUB).toFixed(0)} ₽`, description: "Самый популярный выбор активных пользователей." },
    { name: "Третий", stars: "2000", price: `${(2000 * CONFIG.STAR_EXCHANGE_RATE_RUB).toFixed(0)} ₽`, description: "бебебе бубу блюблюблю." },
  ];

  return (
    <section id="pricing" className="relative w-full overflow-hidden py-20 sm:py-24">
      {/* Добавляем анимированный фон */}
      <AnimatedStarsBackground />
      <div className="container relative z-10 mx-auto max-w-5xl px-4">
        <AnimateOnScroll>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              Выберите свой пакет Звёзд
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Простые и прозрачные цены. Мгновенное получение.
            </p>
            <div className="mt-6 inline-block rounded-md bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
              Доступно для покупки: {CONFIG.TOTAL_AVAILABLE_STARS.toLocaleString('ru-RU')} ⭐️
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={200}>
          <div className="mb-12 mx-auto">
            <CustomAmountCard onBuyClick={onBuyClick} />
          </div>
        </AnimateOnScroll>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {tiers.map((tier, index) => (
            <AnimateOnScroll key={tier.name} delay={index * 150}>
              <div className={`relative flex h-full flex-col rounded-2xl border p-8 shadow-lg transition-all border-neutral-200 dark:border-neutral-800`}>
                <h3 className="text-lg font-semibold leading-6 text-neutral-900 dark:text-neutral-100">{tier.name}</h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{tier.price}</span>
                </p>
                <p className="mt-1 text-sm text-neutral-500">{tier.description}</p>
                <div className="mt-6 flex items-center gap-2">
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <span className="font-mono text-xl font-bold text-neutral-800 dark:text-neutral-200">{tier.stars} Звёзд</span>
                </div>
                <button
                  onClick={() => onBuyClick(tier)}
                  className={`mt-auto pt-6 w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 bg-neutral-100 text-blue-600 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-blue-400 dark:ring-neutral-800 dark:hover:bg-neutral-800`}
                >
                  Купить пакет
                </button>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Иконки SVG (без изменений) ---

function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function GiftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
  );
}

function BotIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
    )
}

function ImageIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
    )
}