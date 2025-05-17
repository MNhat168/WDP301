import { Link } from "react-router-dom";

import illustrationIntro from "../../assets/illustration-intro.svg";

const Hero = () => {
  return (
    <section id="hero">
      {/* Flex Container */}
      <div className="container flex flex-col-reverse items-center px-6 mx-auto mt-10 space-y-0 md:space-y-0 md:flex-row">
        {/* Left Item */}
        <div className="flex flex-col mb-32 space-y-12 md:w-1/2">
          <h1 className="max-w-md text-4xl font-bold text-center md:text-5xl md:text-left">
            Connect with Top Talent for Your Business
          </h1>
          <p className="max-w-sm text-center text-darkGrayishBlue md:text-left">
            Simplify your hiring process by posting job opportunities and
            finding the right candidates efficiently. Empower your team with
            exceptional talent.
          </p>
          <div className="flex justify-center md:justify-start">
            <a
              href="/create-job"
              className="p-3 px-6 pt-2 text-white bg-red-500 border-2 border-red-500 rounded-full hover:bg-red-600 hover:border-red-600 transition-all duration-300 cursor-pointer"
            >
              Post a Job
            </a>
          </div>
        </div>

        {/* Image */}
        <div className="md:w-1/2">
          <img src={illustrationIntro} alt="" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
