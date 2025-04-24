/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Animation Constants
const GSAP_ANIMATION = {
  title: { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
  subtitle: { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' },
  card: { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out' },
  cardActive: { y: -6, scale: 1.03, duration: 0.3, ease: 'power2.out' },
};

const Highlights: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const title = sectionRef.current?.querySelector('#title');
    const subtitle = sectionRef.current?.querySelector('#subtitle');
    const cards = sectionRef.current?.querySelectorAll('.highlight-card');

    if (title) gsap.to(title, GSAP_ANIMATION.title);
    if (subtitle) gsap.to(subtitle, GSAP_ANIMATION.subtitle);
    if (cards) gsap.to(cards, GSAP_ANIMATION.card);

    cards?.forEach((card) => {
      const onActive = () => gsap.to(card, GSAP_ANIMATION.cardActive);
      const onInactive = () =>
        gsap.to(card, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });

      card.addEventListener('touchstart', onActive);
      card.addEventListener('touchend', onInactive);
      card.addEventListener('mouseenter', onActive);
      card.addEventListener('mouseleave', onInactive);
    });

    return () => {
      gsap.killTweensOf([title, subtitle, cards]);
      cards?.forEach((card) => {
        card.removeEventListener('touchstart', () => {});
        card.removeEventListener('touchend', () => {});
        card.removeEventListener('mouseenter', () => {});
        card.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  return (
    <section
      id="highlights"
      ref={sectionRef}
      className="relative w-full min-h-screen bg-gradient-to-b from-zinc-900 to-gray-900 py-10 xs:py-12 sm:py-16 md:py-20 lg:py-24  overflow-hidden"
      // ^^^ الإضافة هنا: lg:mt-[30px] تطبق margin-top: 30px على الشاشات الكبيرة (≥1024px)
    >
      <div className="max-w-[1400px] mx-auto px-3 xs:px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-14 lg:mb-16">
          <h1
            id="title"
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white opacity-0 translate-y-8 tracking-tight"
          >
            Discover Our Highlights
          </h1>
          <p
            id="subtitle"
            className="mt-2 xs:mt-3 sm:mt-4 text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 opacity-0 translate-y-8 max-w-md xs:max-w-lg sm:max-w-xl md:max-w-2xl mx-auto"
          >
            Explore features crafted for excellence, designed just for you.
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 md:gap-8">
          {[
            { src: 'https://i.postimg.cc/j59sfkzg/Screenshot-2025-04-11-134520.png', alt: 'Premium design feature', title: 'Sleek Design', description: 'Elegant aesthetics meet cutting-edge technology.' },
            { src: 'https://i.postimg.cc/3RghcjV9/Screenshot-2025-04-11-134852.png', alt: 'Advanced technology feature', title: 'Smart Technology', description: 'Seamless performance for every moment.' },
            { src: 'https://i.postimg.cc/K876PvX3/Screenshot-2025-04-11-135058.png', alt: 'Comfort fit feature', title: 'Ultimate Comfort', description: 'Designed to fit your lifestyle perfectly.' },
            { src: 'https://i.postimg.cc/Nf8t4xm0/Screenshot-2025-04-11-135207.png', alt: 'Durability feature', title: 'Built to Last', description: 'Engineered for durability and reliability.' },
          ].map((item, index) => (
            <div
              key={index}
              className="highlight-card relative w-full bg-gray-800/40 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm opacity-0 translate-y-10 cursor-pointer transition-all duration-300 hover:shadow-md"
            >
              <div className="relative w-full aspect-[4/3]">
                <img src={item.src} alt={item.alt} className="w-full h-full object-cover transition-transform duration-400" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-300 hover:opacity-75" />
              </div>
              <div className="p-3 xs:p-4 sm:p-5 md:p-6">
                <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold text-white">{item.title}</h3>
                <p className="mt-1 xs:mt-2 text-gray-300 text-xs xs:text-sm sm:text-base md:text-base line-clamp-2">{item.description}</p>
                <a href="#details" className="mt-2 xs:mt-3 inline-block text-blue-400 hover:text-blue-300 text-xs xs:text-sm sm:text-base md:text-base transition-colors">
                  Learn More
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-8 xs:mt-10 sm:mt-12 md:mt-14 lg:mt-16">
          <a
            href="#shop"
            className="inline-block bg-blue-600 text-white px-4 xs:px-5 sm:px-6 md:px-8 py-2 xs:py-2.5 sm:py-3 md:py-4 rounded-full text-sm xs:text-base sm:text-lg md:text-xl font-medium hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Shop the Collection
          </a>
        </div>
      </div>
    </section>
  );
};

export default Highlights;