import React from "react";
import "./Services.css";
import Card from "../Card/Card";
import HeartEmoji from "../../img/heartemoji.png";
import Glasses from "../../img/glasses.png";
import Humble from "../../img/humble.png";
import { motion } from "framer-motion";
import Resume from "./resume.pdf";

const Services = () => {
  // transition
  const transition = {
    duration: 1,
    type: "spring",
  };

  return (
    <div className="services" id="services">
      {/* left side */}
      <div className="awesome">
        <span>Our Awesome</span>
        <span>services</span>
        <span>
          Finding your dream job has never been easier. Everything you need to
          kickstart
          <br />
          your career is available right here, from top job listings to expert
          career advice.
        </span>
        <a href="/cvgenerate" target="_blank" rel="noopener noreferrer">
          <button className="button s-button">Create CV</button>
        </a>

        <div className="blur s-blur1" style={{ background: "#ABF1FF94" }}></div>
      </div>
      {/* right */}
      <div className="cards">
        {/* first card */}
        <motion.div
          initial={{ left: "25rem" }}
          whileInView={{ left: "14rem" }}
          transition={transition}
        >
          <Card
            emoji={HeartEmoji}
            heading={"Employer"}
            detail={"Find a staff for company "}
            url="http://localhost:5173/loginemployeer"
          />
        </motion.div>
        {/* second card */}
        <motion.div
          initial={{ left: "-11rem", top: "12rem" }}
          whileInView={{ left: "-4rem" }}
          transition={transition}
        >
          <Card
            emoji={Glasses}
            heading={"Your Position"}
            detail={"Html, Css, JavaScript, React"}
            url="http://localhost:5173/cvgenerate"
          />
        </motion.div>
        {/* 3rd */}
        <motion.div
          initial={{ top: "19rem", left: "25rem" }}
          whileInView={{ left: "12rem" }}
          transition={transition}
        >
          <Card
            emoji={Humble}
            heading={"Jobseeker"}
            detail={"Find a great job"}           
            url="http://localhost:5173/login"
          />
        </motion.div>
        <div
          className="blur s-blur2"
          style={{ background: "var(--purple)" }}
        ></div>
      </div>
    </div>
  );
};

export default Services;
