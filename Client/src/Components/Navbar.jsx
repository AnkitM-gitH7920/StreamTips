import React from "react";
import "../css/navbar.css";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Navbar() {
  return (
    <header className="navbar">
      <Logo />
      <nav className="nav-links">
        <a href="#templates">Templates</a>
        <a href="#how">How it works</a>
        <a href="#pricing">Pricing</a>
      </nav>
      <div className="nav-actions">
        <Link className="nav-login" to="/login">Log in</Link>
        <Link className="btn btn-primary small" to="/signup">Get started <ArrowRight size={16}/></Link>
      </div>
    </header>
  );
}
