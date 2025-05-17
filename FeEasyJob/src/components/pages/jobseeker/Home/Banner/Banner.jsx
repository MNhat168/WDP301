import React from 'react';
import './Banner.css';
import Lottie from 'react-lottie';
import developer from '../../../../../assets/SvgAnimations/developer.json';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Banner = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: developer,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section ref={ref} className="container px-6 mx-auto relative pt-20 pb-20">
      <div className="flex flex-col lg:flex-row pt-8 md:pt-16 lg:pt-20 px-6 lg:justify-between items-center">
        <div className="text-center lg:text-left max-w-xl">
          <motion.h2
            className="mb-4 text-4xl md:text-5xl text-dark dark:text-white tracking-tight font-extrabold sm:leading-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Web Application
            <span className="text-indigo-600 dark:text-indigo-500"> Developer</span>
          </motion.h2>
          <motion.p
            className="text-lg font-light text-dark dark:text-gray-700 sm:mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
           A passionate individual with a strong focus on building end-to-end CV profiles that highlight key skills and experiences. Currently, I am deepening my knowledge in advanced JavaScript to further improve the functionality and interactivity of online CV profiles.
          </motion.p>
         
          <div className="mt-8 text-center lg:text-left">
            <button className="rounded w-40 bg-indigo-700 hover:bg-indigo-800 py-3 px-6 text-white">
              <a
                rel="noreferrer"
                target="_blank"
                href="/cvprofile"
              >
                CV Profile
              </a>
            </button>
          </div>
        </div>
        <div className="mt-12 lg:mt-0 flex justify-center lg:justify-end w-full">
          <Lottie options={defaultOptions} height={'70%'} width={'100%'} />
        </div>
      </div>
    </section>
  );
};

export default Banner;
