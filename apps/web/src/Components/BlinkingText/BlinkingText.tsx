import React from "react";
import './BlinkingText.css';

const BlinkingText = ({ text }) => {
  return <span className="blinking-text">{text}</span>;
};

export default BlinkingText;
