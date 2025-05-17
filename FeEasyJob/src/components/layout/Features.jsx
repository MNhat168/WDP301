import React from "react";
import { Link } from "react-scroll";

const Features = () => {
  return (
    <section id="features">
      {/* Flex Container */}
      <div className="container flex flex-col px-4 mx-auto mt-10 space-y-12 md:space-y-0 md:flex-row">
        {/* What's Different */}
        <div className="flex flex-col space-y-12 md:w-1/2">
          <h2 className="max-w-md text-4xl font-bold text-center md:text-left">
            Manage Your Created Jobs Effectively
          </h2>
          <p className="max-w-sm text-center text-darkGrayishBlue md:text-left">
            With our platform, you can easily track and manage all the jobs
            you’ve created. Stay organized, monitor applications, and make
            informed decisions effortlessly.
          </p>
          <div className="flex justify-center md:justify-start">
            <a
              href="/jobslist"
              className="p-3 px-6 pt-2 text-white bg-red-500 border-2 border-red-500 rounded-full hover:bg-red-600 hover:border-red-600 transition-all duration-300 cursor-pointer"
            >
              View Created Jobs
            </a>
          </div>
        </div>

        {/* Numbered List */}
        <div className="flex flex-col space-y-8 md:w-1/2">
          {/* List Item 1 */}
          <div className="flex flex-col space-y-3 md:space-y-0 md:space-x-6 md:flex-row">
            {/* Heading */}
            <div className="rounded-l-full bg-brightRedSupLight md:bg-transparent">
              <div className="flex items-center space-x-2">
                <div className="px-4 py-2 text-white rounded-full md:py-1 bg-brightRed">
                  01
                </div>
                <h3 className="text-base font-bold md:mb-4 md:hidden">
                  Track company-wide progress
                </h3>
              </div>
            </div>

            <div>
              <h3 className="hidden mb-4 text-lg font-bold md:block">
                Track company-wide progress
              </h3>
              <p className="text-darkGrayishBlue">
                See how your day-to-day tasks fit into the wider vision. Go from
                tracking progress at the milestone level all the way done to the
                smallest of details. Never lose sight of the bigger picture
                again.
              </p>
            </div>
          </div>

          {/* List Item 2 */}
          <div className="flex flex-col space-y-3 md:space-y-0 md:space-x-6 md:flex-row">
            {/* Heading */}
            <div className="rounded-l-full bg-brightRedSupLight md:bg-transparent">
              <div className="flex items-center space-x-2">
                <div className="px-4 py-2 text-white rounded-full md:py-1 bg-brightRed">
                  02
                </div>
                <h3 className="text-base font-bold md:mb-4 md:hidden">
                  Advanced built-in reports
                </h3>
              </div>
            </div>

            <div>
              <h3 className="hidden mb-4 text-lg font-bold md:block">
                Advanced built-in reports
              </h3>
              <p className="text-darkGrayishBlue">
                Set internal delivery estimates and track progress toward
                company goals. Our customisable dashboard helps you build out
                the reports you need to keep key stakeholders informed.
              </p>
            </div>
          </div>

          {/* List Item 3 */}
          <div className="flex flex-col space-y-3 md:space-y-0 md:space-x-6 md:flex-row">
            {/* Heading */}
            <div className="rounded-l-full bg-brightRedSupLight md:bg-transparent">
              <div className="flex items-center space-x-2">
                <div className="px-4 py-2 text-white rounded-full md:py-1 bg-brightRed">
                  03
                </div>
                <h3 className="text-base font-bold md:mb-4 md:hidden">
                  Everything you need in one place
                </h3>
              </div>
            </div>

            <div>
              <h3 className="hidden mb-4 text-lg font-bold md:block">
                Everything you need in one place
              </h3>
              <p className="text-darkGrayishBlue">
                Stop jumping from one service to another to communicate, store
                files, track tasks and share documents. Manage offers an
                all-in-one team productivity solution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
