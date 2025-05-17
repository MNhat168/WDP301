import React from "react";
import "./Footer.css";
import Wave from "../../img/wave.png";
import { UilInstagram, UilFacebookF, UilGithub } from "@iconscout/react-unicons";



const Footer = () => {
  return (
    <div className="footer">
      <img src={Wave} alt="" style={{ width: "100%" }} />
      <div className="f-content">
        <span>Zainkeepscode@gmail.com</span>
        <div className="f-icons">
          <UilInstagram color="white" size={"3rem"} />
          <UilFacebookF color="white" size={"3rem"} />
          <UilGithub color="white" size={"3rem"} />
        </div>
      </div>
    </div>
  );
};

export default Footer;
