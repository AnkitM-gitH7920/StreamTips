// Css imports
import "../css/auth-layout.css";

// Component imports
import DotLoader from "./Loaders/DotLoader.jsx";
import TemplatePreview from "./TemplatePreview";
import Logo from "./Logo";
import Button from "./Button";
import StatusToast from "./StatusToast.jsx";

// Library imports
import React, { useState, useEffect } from "react";
import validator from "validator";
import { axiosInstance } from "../utils/axiosInstance.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthLayout({ signup = false }) {
     // useStates
     const [email, setEmail] = useState("");
     const [isStatusToastVisible, setStatusToastVisible] = useState(false);
     const [statusToastData, setStatusToastData] = useState({});

     // Mutations and queries
     const loginMutation = useMutation({
          mutationKey: ["login"],
          mutationFn: async () => {
               const response = await axiosInstance.post("/auth/magic-link/send", { email });
               return response;
          },
          onError: (error) => {
               const errorData = error.response?.data
               setStatusToastVisible(true);
               setStatusToastData({
                    success: errorData.success,
                    message: errorData.message,
               })
               return;
          },
          onSuccess: (response) => {
               const serverResponse = response?.data;
               setEmail("");
               setStatusToastVisible(true);
               setStatusToastData({
                    success: serverResponse.success,
                    message: serverResponse.message,
               });
          },
          retryDelay: 3
     })

     // Helper function
     const handleLoginSubmit = (e) => {
          e.preventDefault();
          const emailValidation = validator.isEmail(email);
          if (!emailValidation) {
               console.log("Invalid email");
               return;
          }
          loginMutation.mutate()
     }
     const handleSignupSubmit = (e) => {
          e.preventDefault();
          console.log("Signed up")
     }

     // async functions

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
                    <div className="auth-form">
                         <div className="eyebrow">{signup ? "JOIN STREAMTIPS" : "WELCOME BACK"}</div>
                         <h1>{signup ? "Create your account." : "Welcome back."}</h1>
                         <p>
                              {signup
                                   ? "Start building better moments for your community."
                                   : "Log in to continue to your creator dashboard."}</p>
                         {signup && <label>Full name<input required placeholder="Alex Morgan" /></label>}

                         <label>Email address
                              <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="you@example.com" />
                         </label>
                         {signup && <label>Phone number<input required type="text" placeholder="+91 0912345678" /></label>}
                         {/* <label>Password<input type="password" placeholder="••••••••" /></label> */}
                         {/* {signup && <label>Confirm password<input type="password" placeholder="••••••••" /></label>} */}
                         {!signup &&
                              <div className="form-row">
                                   <label className="checkbox"><input style={{ accentColor: "#064E3B", cursor: "pointer" }} type="checkbox" /> Remember me </label>
                                   <a href="#">Forgot password?</a></div>
                         }
                         <Button style={{ cursor: loginMutation.isPending ? "not-allowed" : "pointer" }} onClick={!signup
                              ? (e) => { handleLoginSubmit(e) }
                              : (e) => { handleSignupSubmit(e) }} className={loginMutation.isPending ? "full btn-disabled" : "full"}>
                              {loginMutation.isPending
                                   ? (<DotLoader></DotLoader>)
                                   : (
                                        <>
                                             {signup ? "Create account" : "Continue"}
                                             <ArrowRight size={17} />
                                        </>
                                   )
                              }
                         </Button>
                         <div className="divider"><span>or</span></div>
                         <button onClick={() => {window.location.href=`${import.meta.env.VITE_API_BASE_URL}/auth/google`}} className="google-btn">
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
                    </div>
               </div>
               {isStatusToastVisible && <StatusToast
                    success={statusToastData.success}
                    message={statusToastData.message}
                    onClose={() => { setStatusToastVisible(false) }}>
               </StatusToast>}
          </div>
     )
}
