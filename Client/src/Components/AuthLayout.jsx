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

export default function AuthLayout() {
     // useStates
     const [email, setEmail] = useState("");
     const [isStatusToastVisible, setStatusToastVisible] = useState(false);
     const [statusToastData, setStatusToastData] = useState({});
     const [isInputValidationError, setIsInputValidationError] = useState(false);
     const [validationErrorInfo, setValidationErrorInfo] = useState({});

     // Mutations and queries
     const loginMutation = useMutation({
          mutationKey: ["login"],
          mutationFn: async () => {
               const response = await axiosInstance.post("/auth/magic-link/send", { email });
               return response;
          },
          onError: (error) => {
               const errorData = error.response?.data;
               console.log(errorData)
               setStatusToastVisible(true);
               setStatusToastData({
                    success: errorData.success,
                    message: errorData.message,
               });
          },
          onSuccess: (response) => {
               const serverResponse = response?.data;
               console.log(serverResponse)
               setEmail("");
               setStatusToastVisible(true);
               setStatusToastData({
                    success: serverResponse.success,
                    message: serverResponse.message,
               });
          },
          retryDelay: 3,
     });

     // Helper function
     const handleLoginSubmit = (e) => {
          e.preventDefault();
          const emailValidation = validator.isEmail(email);
          if (!emailValidation) {
               setIsInputValidationError(true);
               setValidationErrorInfo({
                    type: "email",
                    errorMsg: "Please enter a valid email",
               });
               return;
          } else {
               setIsInputValidationError(false);
               setValidationErrorInfo({});
               loginMutation.mutate();
          }
     };

     // async functions

     // useEffect
     useEffect(() => {
          if (!email) {
               setIsInputValidationError(false);
               setValidationErrorInfo({});
               return;
          }
          const validation = validator.isEmail(email);
          if (!validation) {
               setIsInputValidationError(true);
               setValidationErrorInfo({
                    type: "email",
                    errorMsg: "Invalid email format",
               });
               return;
          } else {
               setIsInputValidationError(false);
               setValidationErrorInfo({});
          }
     }, [email]);

     return (
          <div className="auth-page">
               <button
                    style={{
                         height: "100px",
                         width: "100px",
                         position: "absolute",
                         right: "10px",
                         top: "10px",
                    }}
                    onClick={() => { setEmail("ankitmehra7920@gmail.com") }}
               >
                    Dummy data
               </button>
               <div className="auth-brand-panel">
                    <Logo />
                    <div className="auth-quote">
                         <div className="quote-mark">“</div>
                         <h2>
                              Your community
                              <br />
                              is the <em>show.</em>
                         </h2>
                         <p>Give every supporter a reason to come back.</p>
                    </div>
                    <div className="auth-mini-preview">
                         <TemplatePreview tone="gold" />
                         <div className="auth-preview-label">
                              <Sparkles size={15} /> Live tip experience
                         </div>
                    </div>
               </div>
               <div className="auth-form-panel">
                    <div className="mobile-auth-logo">
                         <Logo />
                    </div>
                    <div className="auth-form">
                         <div className="eyebrow">WELCOME BACK</div>
                         <h1>Welcome back.</h1>
                         <p>Log in to continue to your creator dashboard.</p>

                         <label
                              className={
                                   isInputValidationError && validationErrorInfo.type === "email" ? "label-error" : ""
                              }
                         >
                              {isInputValidationError && validationErrorInfo.type === "email"
                                   ? validationErrorInfo.errorMsg
                                   : "Email address"}
                              <input
                                   className={
                                        isInputValidationError && validationErrorInfo.type === "email"
                                             ? "inputbar-error"
                                             : ""
                                   }
                                   value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   required
                                   type="email"
                                   placeholder="you@example.com"
                              />
                         </label>

                         <div className="form-row">
                              <label className="checkbox">
                                   <input style={{ accentColor: "#064E3B", cursor: "pointer" }} type="checkbox" />{" "}
                                   Remember me{" "}
                              </label>
                         </div>
                         <Button
                              style={{
                                   cursor: loginMutation.isPending ? "not-allowed" : "pointer",
                              }}
                              onClick={(e) => {
                                   handleLoginSubmit(e);
                              }}
                              className={loginMutation.isPending ? "full btn-disabled" : "full"}
                         >
                              {loginMutation.isPending ? (
                                   <DotLoader></DotLoader>
                              ) : (
                                   <>
                                        Continue
                                        <ArrowRight size={17} />
                                   </>
                              )}
                         </Button>
                         <div className="divider">
                              <span>or</span>
                         </div>
                         <button
                              onClick={() => {
                                   window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
                              }}
                              className="google-btn"
                         >
                              <span style={{ display: "flex", alignItems: "center" }} className="google-g">
                                   <img
                                        height={17}
                                        width={17}
                                        src="../../assets/google.png"
                                        alt="Google..."
                                        loading="lazy"
                                   />
                              </span>{" "}
                              Continue with Google
                         </button>
                         <p className="auth-switch">
                              Just hanging around?{" "}
                              <Link
                                   onClick={() => {
                                        window.location.href = import.meta.env.VITE_API_BASE_URL + "/auth/guest"
                                   }}
                              >
                                   Continue as guest
                              </Link>
                         </p>
                    </div>
               </div>
               {isStatusToastVisible && (
                    <StatusToast
                         success={statusToastData.success}
                         message={statusToastData.message}
                         onClose={() => {
                              setStatusToastVisible(false);
                         }}
                    ></StatusToast>
               )}
          </div>
     );
}
