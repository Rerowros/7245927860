// app/about/page.tsx

"use client"; // <-- ВАЖНО: Добавляем, т.к. используем хуки (useInView)

import type { SVGProps, ReactNode } from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer"; // <-- ДОБАВЛЕНО

// --- КОМПОНЕНТЫ, СКОПИРОВАННЫЕ ДЛЯ ЕДИНООБРАЗИЯ ---
// В реальном проекте их лучше вынести в общие файлы (e.g., /components/Header.tsx, /components/Icons.tsx)

function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}


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

const AnimateOnScroll = ({ children, delay = 0, className = "", as: Component = 'div' }: { children: ReactNode, delay?: number, className?: string, as?: React.ElementType }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Component
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  );
};

// --- НОВЫЙ КОМПОНЕНТ: Анимированный фон со звёздами ---
const AnimatedStarsBackground = () => {
  // Создаем 40 "звёзд" с рандомными параметрами анимации
  const stars = Array.from({ length: 40 }).map((_, i) => (
    <div
      key={i}
      className="star-particle"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 15}s`,
        animationDuration: `${Math.random() * 10 + 10}s`,
        transform: `scale(${Math.random() * 0.5 + 0.5})`,
      }}
    />
  ));

  return <div className="absolute inset-0 -z-10 overflow-hidden">{stars}</div>;
};


// --- Основной компонент страницы "О Звёздах" ---
export default function AboutPage() {
  const faqItems = [
    {
      q: "Как быстро я получу Звёзды?",
      a: "Обычно начисление происходит в течение 10-15 минут после того, как администратор примет ваш заказ. Мы стараемся работать максимально оперативно.",
    },
    {
      q: "Что делать, если я ввёл неправильный username?",
      a: "На этапе подтверждения в модальном окне вы увидите аватар и имя пользователя. Если вы заметили ошибку, просто вернитесь на шаг назад и введите корректный username. Если вы подтвердили неверный аккаунт, немедленно свяжитесь с нашей поддержкой.",
    },
    {
      q: "Это безопасно?",
      a: "Абсолютно. Мы используем проверенные платёжные шлюзы, такие как Crypto Bot и LZT Market. Мы не запрашиваем ваш пароль или доступ к аккаунту. Всё, что нам нужно, — это ваш публичный username для начисления Звёзд.",
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-black">
      <Header />
      {/* Оборачиваем main в relative, чтобы фон позиционировался относительно него */}
      <main className="relative flex-1 overflow-hidden">
        {/* Добавляем анимированный фон */}
        <AnimatedStarsBackground />
        
        <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-24">
          <div className="space-y-12">
            <AnimateOnScroll className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-5xl">
                Что такое Звёзды Telegram?
              </h1>
              <p className="text-xl leading-8 text-neutral-600 dark:text-neutral-400">
                Звёзды (Telegram Stars) — это внутренняя валюта, которую можно использовать для оплаты цифровых товаров и услуг, предлагаемых ботами и мини-приложениями в Telegram. Это простой и безопасный способ поддержать авторов и получить доступ к премиум-функциям.
              </p>
            </AnimateOnScroll>
            
            <AnimateOnScroll delay={200} className="space-y-6 pt-8 border-t border-neutral-200/80 dark:border-neutral-800/80">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Как это работает?</h2>
              <p className="text-base leading-7 text-neutral-700 dark:text-neutral-300">Процесс получения и использования Звёзд максимально прост и прозрачен:</p>
              <ol className="list-decimal list-inside space-y-4 marker:font-semibold marker:text-blue-600 dark:marker:text-blue-400">
                {/* Используем stagger-анимацию для списка */}
                {[{
                  title: "Покупка:",
                  text: "Вы выбираете подходящий пакет Звёзд на нашем сайте и совершаете покупку через удобный для вас метод."
                }, {
                  title: "Получение:",
                  text: "После подтверждения оплаты, мы связываемся с вами и начисляем Звёзды на ваш аккаунт в Telegram. Это происходит быстро и безопасно."
                }, {
                  title: "Использование:",
                  text: "Вы можете тратить полученные Звёзды в любом боте или мини-приложении, которое поддерживает этот способ оплаты. Это может быть оплата подписки, покупка цифрового контента, донат автору и многое другое."
                }].map((item, index) => (
                  <AnimateOnScroll as="li" key={index} delay={100 * index} className="text-base leading-7 text-neutral-700 dark:text-neutral-300">
                    <strong className="font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</strong> {item.text}
                  </AnimateOnScroll>
                ))}
              </ol>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200} className="space-y-6 pt-8 border-t border-neutral-200/80 dark:border-neutral-800/80">
                <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Для чего нужны Звёзды?</h2>
                <p className="text-base leading-7 text-neutral-700 dark:text-neutral-300">Звёзды открывают доступ к растущей экосистеме цифровых сервисов внутри Telegram. Основные направления использования:</p>
                <ul className="list-disc list-inside space-y-3 marker:text-blue-600 dark:marker:text-blue-400">
                     {[{
                      title: "Поддержка авторов:",
                      text: "Вознаграждайте создателей контента, который вам нравится, отправляя им донаты в виде Звёзд."
                    }, {
                      title: "Оплата в мини-приложениях:",
                      text: "Покупайте товары и услуги в играх, магазинах и сервисах, работающих на платформе Telegram Mini Apps."
                    }, {
                      title: "Эксклюзивный контент:",
                      text: "Приобретайте уникальные стикеры, темы оформления, доступ к закрытым каналам и другие цифровые товары."
                    }].map((item, index) => (
                      <AnimateOnScroll as="li" key={index} delay={100 * index} className="text-base leading-7 text-neutral-700 dark:text-neutral-300">
                        <strong className="font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</strong> {item.text}
                      </AnimateOnScroll>
                    ))}
                </ul>
            </AnimateOnScroll>
            
            <AnimateOnScroll delay={200} className="space-y-8 pt-8 border-t border-neutral-200/80 dark:border-neutral-800/80">
                <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Часто задаваемые вопросы (FAQ)</h2>
                <div className="space-y-6">
                    {faqItems.map((item, index) => (
                        <AnimateOnScroll key={index} delay={100 * index}>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{item.q}</h3>
                            <p className="mt-1 text-base leading-7 text-neutral-700 dark:text-neutral-300">{item.a}</p>
                        </AnimateOnScroll>
                    ))}
                </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200} className="flex justify-center pt-8 border-t border-neutral-200/80 dark:border-neutral-800/80">
              <Link 
                href="/#pricing" 
                className="rounded-md bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 glow-effect"
              >
                Вернуться к покупке
              </Link>
            </AnimateOnScroll>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Немного изменим AnimateOnScroll, чтобы он мог рендерить другой тег (например, li) ---

