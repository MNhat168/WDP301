import React from "react";
import "./Card.css";

const Card = ({ emoji, heading, detail, color, url }) => {
  return (
    <div className="card" style={{ borderColor: color }}> 
      <img src={emoji} alt="" />
      <span>{heading}</span>
      <span>{detail}</span>
      <a href={url} className="c-button" target="_blank" rel="noopener noreferrer">
        LEARN MORE
      </a>
    </div>
  );
};

export default Card;

