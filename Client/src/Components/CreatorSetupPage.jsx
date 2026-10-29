import React, { useState } from "react";
import "../css/creator-setup-page.css";

// To be added field
// * Display name
// * Username
// * email
// * Profile picture upload
// * about
// * Creator category
// * Website URL
// * Streaming platforms

// {
//      name: "gender",
//      label: "Gender",
//      placeholder: null,
//      fieldOptionsObj: {
//           fieldType: "selection",
//           selectionOptions: [
//                { option: "Male", onSelectColor: "cyan" },
//                { option: "Female", onSelectColor: "pink" },
//                { option: "Others", onSelectColor: "orange" },
//           ],
//      },
// },
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
          name: "gender",
          label: "Gender",
          placeholder: null,
          fieldOptionsObj: {
               fieldType: "selection",
               selectionOptions: ["Male", "Female", "Others"],
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

const platforms = [
     { key: "kick_platform", platform_name: "Kick", platform_logo_cdn: "https://cdn.simpleicons.org/twitch" },
     { key: "youtube_platform", platform_name: "Kick", platform_logo_cdn: "https://cdn.simpleicons.org/youtube" },
     { key: "kick_platform", platform_name: "Kick", platform_logo_cdn: "https://cdn.simpleicons.org/kick" },
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
     const [message, setMessage] = useState("");
     const [activeGenderBtn, setActiveGenderBtn] = useState("");

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
                                             return (
                                                  <div className="st-setup-row">
                                                       <label htmlFor={name}>{label}</label>
                                                       <div className="st-setup-selection-btns">
                                                            {selectionOptions.map((option) => (
                                                                 <button
                                                                      onClick={() => setActiveGenderBtn(option)}
                                                                      className={`st-setup-selection-btn ${
                                                                           activeGenderBtn === option ? option : ""
                                                                      }`}
                                                                 >
                                                                      {option}
                                                                 </button>
                                                            ))}
                                                       </div>
                                                  </div>
                                             );
                                        }
                                   })}
                                   <div className="st-setup-platforms-container st-setup-row">
                                        <label htmlFor="Platforms">Platforms</label>
                                        <div className="st-setup-platform-options">
                                             {platforms.map(({ key, platform_name, platform_logo_cdn }) => (
                                                  <button key={key}><img src={platform_logo_cdn} alt={platform_name} />{" "}{platform_name}</button>
                                             ))}
                                        </div>
                                   </div>
                              </div>
                              
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
