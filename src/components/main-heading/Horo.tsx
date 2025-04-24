"use client";

import { useEffect, useCallback, useState } from 'react';
import gsap from 'gsap';
import ThreeScene from './ThreeScene';

// Constants
const GSAP_ANIMATION = {
  cta: {
    opacity: 1,
    y: -20,
    delay: 0.8,
    duration: 0.8,
    ease: 'power2.out',
  },
  heroImage: {
    opacity: 1,
    y: 0,
    delay: 1.2,
    duration: 1,
    ease: 'power2.out',
  },
  heroImageFloat: {
    y: '+=9', // Move down 7px
    repeat: -1, // Infinite loop
    yoyo: true, // Reverse to move up 7px
    duration: 1.5, // Smooth speed for floating effect
    ease: 'sine.inOut', // Gentle easing for natural motion
  },
};
  console.time("fetching"); // إضافة لحساب وقت تحميل البيانات

  console.timeEnd("fetching"); // طباعة الوقت الذي استغرقته العملية
const MainHeading: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  // Memoized resize handler (for future use)
  const handleResize = useCallback(() => {
    // Placeholder for responsive logic if needed
  }, []);

  // Handle window resize and client-side mount
  useEffect(() => {
    setIsMounted(true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // GSAP animations
  useEffect(() => {
    if (isMounted) {
      const ctaElement = document.getElementById('cta');
      const heroImageElement = document.getElementById('hero-image');

      if (ctaElement) {
        gsap.to(ctaElement, GSAP_ANIMATION.cta);
      }
      if (heroImageElement) {
        // Initial fade-in animation
        gsap.to(heroImageElement, GSAP_ANIMATION.heroImage);
        // Floating animation (down 7px, up 7px, repeat)
        gsap.to(heroImageElement, GSAP_ANIMATION.heroImageFloat);
      }

      return () => {
        gsap.killTweensOf([ctaElement, heroImageElement]);
      };
    }
  }, [isMounted]);

  return (
    <section className="relative w-full h-screen flex items-center justify-center lg:mt-[100px]">
      {/* ThreeScene Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <ThreeScene />
      </div>

      {/* Hero Image */}
      <div
        id="hero-image"
        className="absolute top-1/4 sm:top-1/3 md:top-1/4 w-full flex justify-center opacity-0 translate-y-10 z-10 px-4 sm:px-6"
      >
        <img
          src="https://i.postimg.cc/0jKVM1bt/Screenshot-2025-04-11-093617-removebg-preview.png"
          alt="Hero product"
          className="w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] h-auto object-contain"
          loading="lazy"
        />
      </div>

      {/* CTA Section */}
      <div
        id="cta"
        className="absolute bottom-13  sm:bottom-20 left-0 right-0 z-20 flex flex-col items-center opacity-0 translate-y-10 px-4 sm:px-6 md:px-8"
      >
        <a
          href="#highlights"
          className="bg-primary text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:bg-primary-dark transition-colors duration-300 text-base sm:text-lg font-medium"
        >
          Buy
        </a>
        {/* <p className="mt-2 text-white text-center font-normal text-base sm:text-lg md:text-xl lg:text-2xl">
          From 
        </p> */}
      </div>
    </section>
  );
};

export default MainHeading;

// useGSAP(() => {
//   const timeline = gsap.timeline({
//     repeat: -1,        // Infinite repeat
//     repeatDelay: 1,    // 1 second delay between repeats
//     yoyo: true         // Reverse animation on each repeat
//   })

//   if (headingRef.current) {
//     // First animation step
//     timeline.to(headingRef.current, {
//       x: 250,
//       rotation: 360,      // Changed 'rotate' to 'rotation' (GSAP standard property)
//       duration: 2,
//       borderRadius: '100%',
//       ease: 'back.inOut'
//     })

//     // Second animation step (runs after first completes)
//     timeline.to(headingRef.current, {
//       x: 250,             // Stays at 250 (no change in position)
//       duration: 2,
//       rotation: 720,      // Additional 360° rotation (cumulative)
//       borderRadius: '100%',
//       ease: 'back.inOut'
//     })

//     // Third animation step (runs after second completes)
//     timeline.to(headingRef.current, {
//       x: 500,
//       scale: 1,          // Explicitly set to 1 (no scaling)
//       duration: 2,
//       rotation: 1080,    // Additional 360° rotation (cumulative)
//       borderRadius: '8px',
//       ease: 'back.inOut'
//     })
//   }

//   return () => {
//     timeline.kill() // Cleanup on unmount
//   }
// }, [])

{
  /* <div
ref={headingRef}
id="main-heading"
className="w-20 h-20 bg-slate-500"
></div> */
}

{
  /* <video className="pointer-events-none" autoPlay muted playsInline={true} key={videoSrc}> */
}
{
  /* <source src={videoSrc} type="video/mp4" /> */
}
{
  /* </video> */
}
