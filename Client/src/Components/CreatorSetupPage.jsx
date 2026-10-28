import React, { useState } from "react";
import "../css/creator-setup-page.css";

// To be added field
// * Display name
// * Username
// * email
// * about
// * Creator category
// * Website URL
// * Streaming platforms
const fields = [
     {
          name: "displayName",
          label: "Display Name",
          placeholder: "How should supporters know you?",
          fieldOptionsObj: {
               fieldType: "planetext",
               selectionOptions: [],
          },
     },
     {
          name: "about",
          label: "About",
          placeholder: "Write something about yourself",
          fieldOptionsObj: {
               fieldType: "planetext",
               selectionOptions: [],
          },
     },
     {
          name: "category",
          label: "Creator category",
          placeholder: "e.g. Design, Gaming, Education",
          fieldOptionsObj: {
               fieldType: "planetext",
               selectionOptions: [],
          },
     },
     {
          name: "website",
          label: "Personal website URL",
          placeholder: "https://yourwebsite.com",
          fieldOptionsObj: {
               fieldType: "planetext",
               selectionOptions: [],
          },
          type: "url",
     },
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

     const field = (name, label, placeholder, fieldType, type = "text") => {
          if (fieldType === "planetext") {
               return (
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
          } else if (fieldType === "selection") {
               return (
                    // Create a field with Ui blended selection dropdown
                    <input type="password" />
               );
          }
     };

     return (
          <main className="st-setup-page">
               <header className="st-setup-topbar">
                    <a className="st-setup-brand" href="/" aria-label="StreamTips home">
                         <span className="st-setup-brand-mark">S</span>
                         <span>StreamTips</span>
                    </a>
                    <div className="st-setup-top-actions">
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
                         <nav className="st-setup-nav" aria-label="Setup navigation">
                              <div className="st-setup-pfp">
                                   <img src="" alt="" />
                              </div>
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
                         <form className="st-setup-form" onSubmit={submit}>
                              <div className="st-setup-two-col">
                                   {field("email", "Email", "e.g. example@email.com", "planetext")}
                                   {field("username", "Username", "Choose a unique username", "planetext")}
                              </div>
                              <div className="st-setup-divider" />
                              <div className="st-setup-rows">
                                   {fields.map(({ name, label, placeholder, fieldOptionsObj, type }) => {
                                        console.log(fieldOptionsObj);
                                        const { fieldType, selectionOptions } = fieldOptionsObj;
                                        if (fieldType === "planetext") {
                                             return (
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
                                             );
                                        } else if (fieldType === "selection") {
                                             return <div>Nothing</div>;
                                        }
                                   })}
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
