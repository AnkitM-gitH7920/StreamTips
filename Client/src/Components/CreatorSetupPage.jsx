import React, { useState } from "react";
import "../css/creator-setup-page.css";

const fields = [
     { name: "about", label: "About", placeholder: "Write something about yourself" },
     { name: "category", label: "Creator category", placeholder: "e.g. Design, Gaming, Education" },
     // { name: "game-category", label: "Games ", placeholder: "e.g. Designer, Developer, Educator" },
     // { name: "instagram", label: "Instagram Profile", placeholder: "https://instagram.com/username", type: "url" },
     { name: "website", label: "Personal website URL", placeholder: "https://yourwebsite.com", type: "url" },
];

export default function CreatorSetupPage({ initialValues = {}, onSubmit, onSkip, isSaving = false }) {
     const [profile, setProfile] = useState({
          displayName: "",
          username: "",
          category: "",
          company: "",
          role: "",
          linkedin: "",
          twitter: "",
          website: "",
          affiliateCode: "",
          ...initialValues,
     });
     const [activeTab, setActiveTab] = useState("creator");
     const [message, setMessage] = useState("");

     const update = ({ target: { name, value } }) => {
          setProfile((current) => ({ ...current, [name]: value }));
          setMessage("");
     };

     const submit = async (event) => {
          event.preventDefault();
          try {
               if (onSubmit) await onSubmit(profile);
               else setMessage("UI preview only — connect onSubmit to your profile setup API to save these details.");
          } catch (error) {
               setMessage(
                    error?.response?.data?.message ||
                         error?.message ||
                         "Could not save your details. Please try again.",
               );
          }
     };

     const field = (name, label, placeholder, type = "text") => (
          <div className="st-setup-field" key={name}>
               <label htmlFor={name}>{label}</label>
               <input
                    id={name}
                    name={name}
                    type={type}
                    value={profile[name] || ""}
                    onChange={update}
                    placeholder={placeholder}
               />
          </div>
     );

     return (
          <main className="st-setup-page">
               <header className="st-setup-topbar">
                    <a className="st-setup-brand" href="/" aria-label="StreamTips home">
                         <span className="st-setup-brand-mark">S</span>
                         <span>StreamTips</span>
                    </a>
                    <div className="st-setup-top-actions">
                         {/* <span className="st-setup-save-state">
                              <i /> Profile setup
                         </span>*/}
                         <span className="st-setup-avatar">
                              {profile.displayName?.trim()?.[0]?.toUpperCase() || "C"}
                         </span>
                    </div>
               </header>

               <div className="st-setup-layout">
                    <aside className="st-setup-sidebar">
                         <div className="st-setup-user">
                              <span className="st-setup-user-avatar">
                                   {profile.displayName?.trim()?.[0]?.toUpperCase() || "C"}
                              </span>
                              <div>
                                   <strong>{profile.displayName || "Your creator profile"}</strong>
                                   <small>{profile.username ? `@${profile.username}` : "Almost ready to go"}</small>
                              </div>
                         </div>
                         {/* <p className="st-setup-nav-heading">WORKSPACE</p>*/}
                         <nav className="st-setup-nav" aria-label="Setup navigation">
                              <div className="st-setup-pfp">
                                   <img src="" alt="" />
                              </div>
                              {/* <button onClick={() => setActiveTab("creator")} type="button" className={activeTab === "creator" ? "active" : ""}>
                                   <span>◉</span> Creator profile <i />
                              </button>
                              <button onClick={() => setActiveTab("personal")} type="button" className={activeTab === "personal" ? "active" : ""} >
                                   <span>▤</span> Personal information
                              </button>*/}
                              {/* <button type="button" onClick={() => setActiveTab("security")}>
                                   <span>◇</span> Login &amp; security
                              </button>*/}
                         </nav>
                         <div className="st-setup-help">
                              <span>?</span>
                              <div>
                                   <strong>Need a hand?</strong>
                                   <small>Set up your page at your own pace.</small>
                              </div>
                         </div>
                    </aside>

                    <section className="st-setup-content">
                         <div className="st-setup-heading">
                              <div>
                                   <p className="st-setup-eyebrow">LET'S GET YOU STARTED</p>
                                   <h1>Set up your profile</h1>
                                   <p className="st-setup-subtitle">
                                        Give your supporters a little context about you. You can update these details
                                        anytime.
                                   </p>
                              </div>
                              <div className="st-setup-progress">
                                   <small>PROFILE SETUP</small>
                                   <strong>
                                        Step 1 <em>of</em> 2
                                   </strong>
                                   <div>
                                        <span />
                                   </div>
                              </div>
                         </div>

                         {/* <div className="st-setup-tabs" role="tablist" aria-label="Profile settings">
                              <button
                                   type="button"
                                   role="tab"
                                   aria-selected={activeTab === "creator"}
                                   className={activeTab === "creator" ? "active" : ""}
                                   onClick={() => setActiveTab("creator")}
                              >
                                   Creator profile
                              </button>
                              <button
                                   type="button"
                                   role="tab"
                                   aria-selected={activeTab === "personal"}
                                   className={activeTab === "personal" ? "active" : ""}
                                   onClick={() => setActiveTab("personal")}
                              >
                                   Personal info
                              </button>*/}
                         {/* <button
                                   type="button"
                                   role="tab"
                                   aria-selected={activeTab === "security"}
                                   className={activeTab === "security" ? "active" : ""}
                                   onClick={() => setActiveTab("security")}
                              >
                                   Login &amp; security
                              </button>*/}
                         {/* </div>*/}

                         <form className="st-setup-form" onSubmit={submit}>
                              {/* <div className="st-setup-section-heading">
                                   <div>
                                        <h2>Creator details</h2>
                                        <p>These details help shape your public StreamTips page.</p>
                                   </div>
                                   <span>PUBLIC PROFILE</span>
                              </div>*/}
                              <div className="st-setup-two-col">
                                   {field("displayName", "Display name", "How should supporters know you?")}
                                   {field("username", "Username", "Choose a unique username")}
                              </div>
                              <div className="st-setup-divider" />
                              <div className="st-setup-rows">
                                   {fields.map(({ name, label, placeholder, type }) => (
                                        <div className="st-setup-row" key={name}>
                                             <label htmlFor={name}>{label}</label>
                                             <input
                                                  id={name}
                                                  name={name}
                                                  type={type || "text"}
                                                  value={profile[name] || ""}
                                                  onChange={update}
                                                  placeholder={placeholder}
                                             />
                                        </div>
                                   ))}
                              </div>
                              {/* <div className="st-setup-affiliate">
                                             <span className="st-setup-spark">✦</span>
                                             <div>
                                                  <strong>Affiliate partner (optional)</strong>
                                                  <p>
                                                       Have a partner code? Add it here. If you were referred by a
                                                       community, use the code they shared with you.
                                                  </p>
                                                  <input
                                                       name="affiliateCode"
                                                       value={profile.affiliateCode}
                                                       onChange={update}
                                                       placeholder="Enter partner code"
                                                       aria-label="Affiliate partner code"
                                                  />
                                             </div>
                                             <small>OPTIONAL</small>
                                        </div>*/}

                              {/* <div className="st-setup-placeholder">
                                        <span>{activeTab === "personal" ? "✧" : "◇"}</span>*/}
                              {/* <h2>
                                             {activeTab === "personal" ? "Personal information" : "Login & security"}
                                        </h2>*/}
                              {/* <p>
                                             {activeTab === "personal"
                                                  ? "Add personal details in the next step. Your public creator profile only displays information you choose to share."
                                                  : "Your sign-in method and security settings can be managed here. Authentication settings are not editable in this profile setup form."}
                                        </p>
                                        <button type="button" onClick={() => setActiveTab("creator")}>
                                             Back to creator profile →
                                        </button>
                                   </div>*/}

                              {/* Create a pop up toast for status*/}
                              <footer className="st-setup-footer">
                                   <p>
                                        <span>♧</span> Your information is protected and kept secure.
                                   </p>
                                   <div>
                                        {onSkip && (
                                             <button type="button" className="st-setup-skip" onClick={onSkip}>
                                                  Do this later
                                             </button>
                                        )}
                                        <button type="submit" className="st-setup-submit" disabled={isSaving}>
                                             {isSaving ? "Saving..." : "Save & continue"} {!isSaving && <b>&gt;</b>}
                                        </button>
                                   </div>
                              </footer>
                         </form>
                    </section>
               </div>
          </main>
     );
}
