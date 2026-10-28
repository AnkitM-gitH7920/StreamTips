import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";

export default function Logo() {
  return <Link className="logo" to="/"><span className="logo-mark">S</span><span>StreamTips</span></Link>;
}
