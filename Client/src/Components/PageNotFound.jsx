import "../css/page-not-found.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function PageNotFound() {
     const navigate = useNavigate();
     
          return (
               <main className="st-not-found">
                    <div className="st-404-glow" />
     
                    <div className="st-404-content">
                         <Link to="/" className="st-404-brand">
                              <span className="st-404-brand-icon">S</span>
                              StreamTips
                         </Link>
     
                         <div className="st-404-illustration">
                              <span>4</span>
                              <div className="st-404-zero">
                                   <div className="st-404-zero-inner" />
                              </div>
                              <span>4</span>
                         </div>
     
                         <div className="st-404-message">
                              <span className="st-404-eyebrow">
                                   PAGE NOT FOUND
                              </span>
     
                              <h1>
                                   Looks like you're <span>lost.</span>
                              </h1>
     
                              <p>
                                   The page you're looking for doesn't exist,
                                   has been moved, or the link might be broken.
                              </p>
                         </div>
     
                         <div className="st-404-actions">
                              <Link to="/" className="st-404-home-btn">
                                   <span>Back to Home</span>
                                   <span>↗</span>
                              </Link>
     
                              <button
                                   type="button"
                                   className="st-404-back-btn"
                                   onClick={() => navigate(-1)}
                              >
                                   Go back
                              </button>
                         </div>
     
                         <span className="st-404-footer">
                              © {new Date().getFullYear()} StreamTips. All rights reserved.
                         </span>
                    </div>
               </main>
          );
}
