import { Link } from "react-router-dom";

import avatarAnisha from "../../assets/avatar-anisha.png";
import avatarAli from "../../assets/avatar-ali.png";
import avatarRichard from "../../assets/avatar-richard.png";

const TestimonialEmp = () => {
  return (
    <section id="testimonials">
      {/* Container to heading and testm blocks */}
      <div className="max-w-6xl px-5 mx-auto mt-32 text-center">
  {/* Heading */}
  <h2 className="text-4xl font-bold text-center">
    Review Applications Efficiently
  </h2>
  <p className="mt-4 text-darkGrayishBlue">
    Get insights into all the CVs submitted by candidates. Analyze, compare, and select the right talent for your team effortlessly.
  </p>

  {/* Testimonials Container */}
  <div className="flex flex-col mt-24 md:flex-row md:space-x-6">
    {/* Testimonial 1 */}
    <div className="flex flex-col items-center p-6 space-y-6 rounded-lg bg-veryLightGray md:w-1/3">
      <img src={avatarAnisha} className="w-16 -mt-14" alt="Anisha Li" />
      <h5 className="text-lg font-bold">Anisha Li</h5>
      <p className="text-sm text-darkGrayishBlue">
        “Using this tool has made reviewing applications much easier. I can focus on finding the perfect fit for our team.”
      </p>
    </div>

    {/* Testimonial 2 */}
    <div className="hidden flex-col items-center p-6 space-y-6 rounded-lg bg-veryLightGray md:flex md:w-1/3">
      <img src={avatarAli} className="w-16 -mt-14" alt="Ali Bravo" />
      <h5 className="text-lg font-bold">Ali Bravo</h5>
      <p className="text-sm text-darkGrayishBlue">
        “It’s incredibly simple to organize and compare CVs. This has saved us countless hours in the recruitment process.”
      </p>
    </div>

    {/* Testimonial 3 */}
    <div className="hidden flex-col items-center p-6 space-y-6 rounded-lg bg-veryLightGray md:flex md:w-1/3">
      <img src={avatarRichard} className="w-16 -mt-14" alt="Richard Watts" />
      <h5 className="text-lg font-bold">Richard Watts</h5>
      <p className="text-sm text-darkGrayishBlue">
        “The ability to filter and shortlist candidates has streamlined our hiring process. It's a game-changer for us.”
      </p>
    </div>
  </div>

  {/* Button */}
  <div className="mb-32 mt-20">
    <a
      href="/listApplyCv"
      className="p-3 px-6 pt-2 text-white bg-red-500 border-2 border-red-500 rounded-full hover:bg-red-600 hover:border-red-600 transition-all duration-300 cursor-pointer"
    >
      View Apply CV
    </a>
  </div>
</div>

    </section>
  );
};

export default TestimonialEmp;
