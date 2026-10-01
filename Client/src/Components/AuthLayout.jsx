import React from "react";
import "../css/auth-layout.css";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import Button from "./Button";
import TemplatePreview from "./TemplatePreview";

export default function AuthLayout({ signup = false }) {
     return (
          <div className="auth-page">
               <div className="auth-brand-panel">
                    <Logo />
                    <div className="auth-quote">
                         <div className="quote-mark">“</div>
                         <h2>Your community<br />is the <em>show.</em></h2>
                         <p>Give every supporter a reason to come back.</p>
                    </div>
                    <div className="auth-mini-preview"><TemplatePreview tone="gold" /><div className="auth-preview-label"><Sparkles size={15} /> Live tip experience</div></div>
               </div>
               <div className="auth-form-panel">
                    <div className="mobile-auth-logo"><Logo /></div>
                    <form action="http://localhost:8000/v1/auth/login" className="auth-form">
                         <div className="eyebrow">{signup ? "JOIN STREAMTIPS" : "WELCOME BACK"}</div>
                         <h1>{signup ? "Create your account." : "Welcome back."}</h1>
                         <p>{
                              signup
                                   ? "Start building better moments for your community."
                                   : "Log in to continue to your creator dashboard."}</p>
                         {signup &&
                              <label>Full name<input required placeholder="Alex Morgan" /></label>
                         }
                         <label>Email address<input required type="email" placeholder="you@example.com" /></label>
                         <label>Phone number<input required type="text" placeholder="+91 0912345678" /></label>
                         {/* <label>Password<input type="password" placeholder="••••••••" /></label> */}
                         {/* {signup && <label>Confirm password<input type="password" placeholder="••••••••" /></label>} */}
                         {!signup &&
                              <div className="form-row">
                                   <label className="checkbox"><input style={{ accentColor: "#064E3B", cursor: "pointer" }} type="checkbox" /> Remember me </label>
                                   <a href="#">Forgot password?</a></div>
                         }
                         <Button className="full">{signup ? "Create account" : "Continue"} <ArrowRight size={17} /></Button>
                         <div className="divider"><span>or</span></div>
                         <button className="google-btn">
                              <span style={{ display: "flex", alignItems: "center" }} className="google-g">
                                   <img height={17} width={17} src="../../assets/google.png" alt="Google..." loading="lazy" />
                              </span> Continue with Google
                         </button>
                         <p className="auth-switch">{
                              signup
                                   ? "Already have an account?"
                                   : "New to StreamTips?"
                         } <Link to={signup ? "/login" : "/signup"}>{
                              signup
                                   ? "Log in"
                                   : "Create an account"
                         }</Link></p>
                         {signup &&
                              <small className="legal">By creating an account, you agree to our Terms and Privacy Policy.</small>
                         }
                    </form>
               </div>
          </div>
     )
}
