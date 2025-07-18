// app/PageClient.tsx
"use client";

import { useState, type SVGProps, FC, ReactNode, useEffect } from "react";
import type { JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import { PurchaseModal } from "@/components/PurchaseModal";
import { useInView } from "react-intersection-observer";

// УДАЛЕНО: Глобальная константа CONFIG больше не нужна,
// так как все настройки приходят из пропсов.

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

// ----- ГЛАВНЫЙ КЛИЕНТСКИЙ КОМПОНЕНТ -----
export default function PageClient({ config }: { config: { STAR_EXCHANGE_RATE_RUB: number; TOTAL_AVAILABLE_STARS: number; MIN_STARS: number; MAX_STARS: number; } }) {
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
        <HeroSection config={config} />
        <QuickCTASection onBuyClick={handleBuyClick} config={config} />
        <FeaturesSection />
        <StatsSection />
        <PricingSection config={config} />
        <FAQSection />
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
        <div className="flex items-center gap-3">
          <a
            href="https://t.me/ruinstar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 backdrop-blur-sm transition-all duration-200 text-sm font-medium glow-effect-sm"
          >
            📢 Канал
          </a>
          <a
            href="https://t.me/ruin_support"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30 backdrop-blur-sm transition-all duration-200 text-sm font-medium glow-effect-sm"
          >
            🛠️ Поддержка
          </a>
          <Link
            href="/#pricing"
            className="inline-flex h-9 items-center justify-center rounded-md bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white shadow transition-all duration-200 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-black glow-effect"
          >
            Купить
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection({ config }: { config: Config }) {
  return (
    <section className="relative w-full overflow-hidden py-20 md:py-32">
      {/* Улучшенный фон с градиентами */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10"></div>
      <div className="absolute left-1/4 top-1/4 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/10 blur-2xl dark:bg-yellow-400/10"></div>
      <div className="absolute right-1/4 bottom-1/4 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-2xl dark:bg-purple-500/10"></div>

      <div className="container mx-auto max-w-5xl px-4 text-center">
        <AnimateOnScroll>
          <div className="mb-6 flex justify-center">
            <div className="relative rounded-full bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-1.5 text-sm leading-6 text-neutral-600 ring-1 ring-inset ring-neutral-900/10 dark:from-blue-900/20 dark:to-purple-900/20 dark:bg-neutral-900 dark:text-neutral-400 dark:ring-white/10">
              <span className="hidden md:inline">🎉 Официальная валюта для цифровых товаров в Telegram.</span>
              <a href="#features" className="font-semibold text-blue-600 dark:text-blue-400">
                <span className="absolute inset-0" aria-hidden="true" /> Узнать больше <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </AnimateOnScroll>
        <AnimateOnScroll delay={100}>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-6xl">
            Расширьте возможности <br /> 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              вашего Telegram
            </span>
          </h1>
        </AnimateOnScroll>
        <AnimateOnScroll delay={200}>
          <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Открывайте премиум-функции, поддерживайте любимых авторов и оплачивайте 
            услуги в ботах и мини-приложениях с помощью Звёзд.
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll delay={300}>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#quick-buy"
              className="group rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:from-blue-500 hover:to-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 glow-effect transform hover:scale-105 duration-200"
            >
              <span className="flex items-center gap-2">
                ⭐ Получить Звёзды
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </a>
            <a
              href="#features"
              className="group text-base font-semibold leading-6 text-neutral-900 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Подробнее 
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1 inline-block">→</span>
            </a>
          </div>
        </AnimateOnScroll>
        
        {/* Добавим визуальные элементы */}
        <AnimateOnScroll delay={400}>
          <div className="mt-16 flex justify-center">
            <div className="relative">
              <div className="flex items-center justify-center gap-4 rounded-2xl bg-white/80 dark:bg-black/80 backdrop-blur-sm p-6 shadow-xl ring-1 ring-neutral-200 dark:ring-neutral-800">
                <div className="flex items-center gap-2">
                  <Image src="/star.svg" alt="Star" width={24} height={24} className="animate-pulse" />
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">От {config.MIN_STARS} звёзд</span>
                </div>
                <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600"></div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Мгновенная доставка</span>
                  <span className="text-green-500">✓</span>
                </div>
                <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600"></div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Криптовалюта</span>
                  <Image src="/tron-trx-logo.svg" alt="TRX" width={16} height={16} />
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

// Быстрая CTA секция - теперь содержит все тарифы и pricing
function QuickCTASection({ onBuyClick, config }: { onBuyClick: (tier: Tier) => void, config: Config }) {
  const [stars, setStars] = useState(() => Math.min(config.MIN_STARS, Math.min(config.MAX_STARS, config.TOTAL_AVAILABLE_STARS)));
  const [animatedStars, setAnimatedStars] = useState(stars);
  const price = (stars * config.STAR_EXCHANGE_RATE_RUB).toFixed(2);
  const [animatedPrice, setAnimatedPrice] = useState(price);
  
  const effectiveMaxStars = Math.min(config.MAX_STARS, config.TOTAL_AVAILABLE_STARS);

  useEffect(() => {
    const handler = setTimeout(() => {
      setAnimatedStars(stars);
      setAnimatedPrice(price);
    }, 250);
    return () => {
      clearTimeout(handler);
    };
  }, [stars, price]);

  const handleBuyCustom = () => {
    onBuyClick({
      name: "Выбранное количество",
      stars: stars.toString(),
      price: `${price} ₽`,
      description: `Покупка ${stars} звёзд по вашему выбору.`,
    });
  };

  // Основные тарифы
  const tiers = [
    { name: "Стартовый", stars: "100", price: `${(100 * config.STAR_EXCHANGE_RATE_RUB).toFixed(0)} ₽`, description: "Для начинающих" },
    { name: "Популярный", stars: "500", price: `${(500 * config.STAR_EXCHANGE_RATE_RUB).toFixed(0)} ₽`, description: "Выбор большинства", isPopular: true },
    { name: "Максимальный", stars: "2000", price: `${(2000 * config.STAR_EXCHANGE_RATE_RUB).toFixed(0)} ₽`, description: "Для активных пользователей" },
  ];

  const progressPercentage = effectiveMaxStars > config.MIN_STARS ? ((stars - config.MIN_STARS) / (effectiveMaxStars - config.MIN_STARS)) * 100 : 0;
  const sliderStyle = {
    '--slider-progress': `${progressPercentage}%`,
    '--slider-track-bg-light': '#e5e7eb',
    '--slider-track-bg-dark': '#374151',
    '--slider-accent-color': '#2563eb',
  } as React.CSSProperties;

  return (
    <section id="quick-buy" className="relative py-16 bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/40 dark:to-purple-950/40 backdrop-blur-sm overflow-hidden">
      <AnimatedStarsBackground />
      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              🚀 Быстрая покупка
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Выберите подходящий пакет или настройте своё количество
            </p>
          </div>
        </AnimateOnScroll>
        
        {/* Кастомный слайдер */}
        <AnimateOnScroll delay={200}>
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative rounded-2xl bg-white/80 dark:bg-black/80 backdrop-blur-sm p-8 shadow-xl ring-1 ring-white/20 dark:ring-white/10 glow-effect-purple">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm px-4 py-1 text-sm font-semibold text-white glow-effect">
                Индивидуальный выбор
              </div>
              
              <div className="text-center mb-8">
                <div className="flex items-end justify-center gap-2 mb-4">
                  <StarIcon className="h-8 w-8 text-yellow-400 mb-1 animate-pulse" />
                  <span key={animatedStars} className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 animate-scale-in">
                    {animatedStars}
                  </span>
                  <span className="text-lg text-neutral-500 mb-1">звёзд</span>
                </div>
                <p key={animatedPrice} className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text animate-scale-in">
                  {animatedPrice} ₽
                </p>
              </div>

              <div className="w-full group mb-6">
                <input
                  type="range"
                  min={config.MIN_STARS}
                  max={effectiveMaxStars}
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
                  `}
                />
                <div className="mt-2 flex justify-between text-xs font-medium text-neutral-500">
                  <span>{config.MIN_STARS}</span>
                  <span>{effectiveMaxStars}</span>
                </div>
              </div>
              
              <button
                onClick={handleBuyCustom}
                className="w-full rounded-lg bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-purple-500/80 hover:to-pink-500/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 glow-effect transform hover:scale-105"
              >
                Купить {stars} звёзд за {price} ₽
              </button>
            </div>
          </div>
        </AnimateOnScroll>
        
        {/* Готовые пакеты */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {tiers.map((tier, index) => (
            <AnimateOnScroll key={tier.name} delay={index * 100 + 400}>
              <div className={`card-hover relative rounded-2xl bg-white/60 dark:bg-black/60 backdrop-blur-sm p-6 shadow-lg ring-1 ring-white/20 dark:ring-white/10 transition-all duration-300 hover:shadow-xl hover:scale-105 glow-effect-sm ${
                tier.isPopular ? 'ring-2 ring-blue-500/50 glow-effect-blue' : ''
              }`}>
                {tier.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600/80 to-cyan-600/80 backdrop-blur-sm px-3 py-1 text-sm font-semibold text-white glow-effect">
                    🔥 Хит продаж
                  </div>
                )}
                <div className="text-center">
                  <div className="mb-4">
                    <Image src="/star.svg" alt="Star" width={32} height={32} className="mx-auto animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{tier.stars}</span>
                    <span className="text-sm text-neutral-500 ml-1">звёзд</span>
                  </div>
                  <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mb-4">{tier.price}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">{tier.description}</p>
                  <button
                    onClick={() => onBuyClick(tier)}
                    className="w-full rounded-lg bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-sm px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-500/80 hover:to-purple-500/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 glow-effect transform hover:scale-105"
                    >
                      Купить сейчас
                    </button>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>        
        <AnimateOnScroll delay={700}>
          <div className="text-center mt-12">
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Есть вопросы? Наша поддержка всегда готова помочь!
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://t.me/ruin_support"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-green-400/80 transition-all duration-200 font-medium glow-effect-green"
              >
                🛠️ Связаться с поддержкой
              </a>
              <a
                href="https://t.me/ruinstar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-blue-400/80 transition-all duration-200 font-medium glow-effect-blue"
              >
                📢 Наш канал
              </a>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <GiftIcon className="h-8 w-8" />,
      title: "Поддержка авторов",
      description: "Донатьте любимым каналам и вознаграждайте их за качественный контент.",
      color: "bg-gradient-to-br from-pink-500 to-rose-500"
    },
    {
      icon: <BotIcon className="h-8 w-8" />,
      title: "Оплата в мини-приложениях",
      description: "Платите за цифровые услуги и товары в развивающейся экосистеме Telegram Mini Apps.",
      color: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
      icon: <ImageIcon className="h-8 w-8" />,
      title: "Покупка цифровых товаров",
      description: "Приобретайте эксклюзивные стикеры, темы оформления и многое другое.",
      color: "bg-gradient-to-br from-purple-500 to-indigo-500"
    },
  ];

  return (
    <section id="features" className="bg-white dark:bg-black py-20 sm:py-24">
      <div className="container mx-auto max-w-5xl px-4">
        <AnimateOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              ✨ На что можно потратить Звёзды
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Звёзды открывают вселенную возможностей прямо внутри Telegram.
            </p>
          </div>
        </AnimateOnScroll>
        <div className="mt-16 grid grid-cols-1 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-12">
          {features.map((feature, index) => (
            <AnimateOnScroll key={feature.title} delay={index * 150}>
              <div className="group flex flex-col items-center text-center hover:scale-105 transition-transform duration-300">
                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${feature.color} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">{feature.title}</h3>
                <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">{feature.description}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

// Секция статистики
function StatsSection() {
  const stats = [
    { number: "10,000+", label: "Довольных клиентов", icon: "👥" },
    { number: "50M+", label: "Звёзд продано", icon: "⭐" },
    { number: "24/7", label: "Поддержка", icon: "🛠️" },
    { number: "100%", label: "Безопасность", icon: "🔒" },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto max-w-5xl px-4">
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              🏆 Наши достижения
            </h2>
            <p className="text-lg text-blue-100">
              Цифры, которые говорят за нас
            </p>
          </div>
        </AnimateOnScroll>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <AnimateOnScroll key={stat.label} delay={index * 100}>
              <div className="text-center group">
                <div className="text-4xl mb-2 transform group-hover:scale-125 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-1 group-hover:text-yellow-300 transition-colors">
                  {stat.number}
                </div>
                <div className="text-sm text-blue-100 group-hover:text-white transition-colors">
                  {stat.label}
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

type Config = { STAR_EXCHANGE_RATE_RUB: number; TOTAL_AVAILABLE_STARS: number; MIN_STARS: number; MAX_STARS: number; };

const AnimatedStarsBackground = () => {
  const [stars, setStars] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const arr = Array.from({ length: 40 }).map((_, i) => (
      <div
        key={i}
        className="star-particle"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 15}s`,
          animationDuration: `${Math.random() * 10 + 10}s`,
          transform: `scale(${Math.random() * 0.5 + 0.5})`
        }}
      />
    ));
    setStars(arr);
  }, []);

  return <div className="absolute inset-0 z-0 overflow-hidden">{stars}</div>;
};

function PricingSection({ config }: { config: Config }) {
  return (
    <section id="pricing" className="relative w-full overflow-hidden py-20 sm:py-24">
      <AnimatedStarsBackground />
      <div className="container relative z-10 mx-auto max-w-5xl px-4">
        <AnimateOnScroll>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              ⭐ Статистика звёзд
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Информация о доступных звёздах в реальном времени
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="inline-block rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-3 text-lg font-bold text-yellow-800 dark:from-yellow-900/40 dark:to-orange-900/40 dark:text-yellow-300 shadow-lg">
                Доступно для покупки: {config.TOTAL_AVAILABLE_STARS.toLocaleString('ru-RU')} ⭐️
              </div>
              <div className="inline-block rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 text-lg font-bold text-blue-800 dark:from-blue-900/40 dark:to-purple-900/40 dark:text-blue-300 shadow-lg">
                Курс: {config.STAR_EXCHANGE_RATE_RUB} ₽ за звезду
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={200}>
          <div className="text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="animate-pulse">
                  <StarIcon className="h-16 w-16 text-yellow-400" />
                </div>
                <div className="animate-pulse animation-delay-200">
                  <StarIcon className="h-12 w-12 text-yellow-300" />
                </div>
                <div className="animate-pulse animation-delay-400">
                  <StarIcon className="h-20 w-20 text-yellow-500" />
                </div>
                <div className="animate-pulse animation-delay-600">
                  <StarIcon className="h-12 w-12 text-yellow-300" />
                </div>
                <div className="animate-pulse animation-delay-800">
                  <StarIcon className="h-16 w-16 text-yellow-400" />
                </div>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                Звёзды пополняются в режиме реального времени
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="#quick-buy"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200 font-semibold glow-effect transform hover:scale-105"
                >
                  <StarIcon className="h-5 w-5" />
                  Купить звёзды
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm text-blue-600 dark:text-blue-400 px-8 py-4 rounded-lg hover:bg-white/90 dark:hover:bg-black/90 transition-all duration-200 font-semibold glow-effect-sm"
                >
                  Узнать больше
                </a>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

// FAQ секция
function FAQSection() {
  const faqs = [
    {
      question: "Как быстро приходят звёзды?",
      answer: "Звёзды поступают на ваш аккаунт мгновенно после подтверждения платежа. Обычно это занимает не более 5 минут."
    },
    {
      question: "Какие способы оплаты доступны?",
      answer: "Мы принимаем криптовалюту (TRX) и другие популярные методы оплаты. Все платежи обрабатываются безопасно."
    },
    {
      question: "Есть ли лимиты на покупку?",
      answer: "Минимальная покупка составляет 100 звёзд. Максимальное количество зависит от наличия на складе."
    },
    {
      question: "Что делать, если звёзды не пришли?",
      answer: "Наша поддержка работает 24/7. Свяжитесь с нами через Telegram, и мы решим любой вопрос в кратчайшие сроки."
    },
    {
      question: "Безопасно ли покупать звёзды?",
      answer: "Да, абсолютно безопасно. Мы используем официальные методы Telegram API и не нарушаем условия использования."
    },
    {
      question: "Можно ли вернуть деньги?",
      answer: "Поскольку звёзды доставляются мгновенно, возврат возможен только в исключительных случаях по согласованию с поддержкой."
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-black">
      <div className="container mx-auto max-w-4xl px-4">
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              ❓ Часто задаваемые вопросы
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Ответы на самые популярные вопросы
            </p>
          </div>
        </AnimateOnScroll>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <AnimateOnScroll key={index} delay={index * 100}>
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-6 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  {faq.question}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
        
        <AnimateOnScroll delay={600}>
          <div className="text-center mt-12">
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Не нашли ответ на свой вопрос?
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://t.me/ruin_support"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-green-400/80 transition-all duration-200 font-medium glow-effect-green"
              >
                �️ Связаться с поддержкой
              </a>
              <a
                href="https://t.me/ruinstar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-blue-400/80 transition-all duration-200 font-medium glow-effect-blue"
              >
                📢 Наш канал
              </a>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}


// --- Иконки SVG (без изменений) ---

function StarIcon({ className, ...props }: { className?: string; [key: string]: any }) {
  return (
    <Image src="/star.svg" alt="Star" width={24} height={24} className={className} />
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