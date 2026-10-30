import "../css/page-not-found.css";
import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function PageNotFound() {
     const navigate = useNavigate();

     return (
          <main className="st-not-found">
               <div className="st-not-found-container">
                    <Link to="/" className="st-not-found-brand">
                         <span className="st-not-found-logo">S</span>
                         <span>StreamTips</span>
                    </Link>

                    <div className="st-not-found-content">
                         <div className="st-not-found-code">
                              404<span>.</span>
                         </div>

                         <span className="st-not-found-label">PAGE NOT FOUND</span>

                         <h1>
                              Well, this is <span>awkward.</span>
                         </h1>

                         <p>The page you're looking for doesn't exist or may have been moved somewhere else.</p>

                         <div className="st-not-found-actions">
                              <Link to="/" className="st-not-found-primary">
                                   Back to home
                                   <span>↗</span>
                              </Link>

                              <button type="button" className="st-not-found-secondary" onClick={() => navigate(-1)}>
                                   Go back
                              </button>
                         </div>
                    </div>

                    <footer className="st-not-found-footer">
                         <span>© {new Date().getFullYear()} StreamTips</span>
                         <span>Made for creators.</span>
                    </footer>
               </div>
          </main>
     );
}
