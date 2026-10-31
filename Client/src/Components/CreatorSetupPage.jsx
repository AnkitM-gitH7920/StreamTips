import React, { useEffect, useState } from "react";
import "../css/creator-setup-page.css";
import StatusToast from "./StatusToast";
import validator from "validator";

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
     },
];

// const platforms = [
//      { key: "twitch_platform", platform_name: "Twitch", platform_logo_cdn: "https://cdn.simpleicons.org/twitch" },
//      { key: "youtube_platform", platform_name: "Youtube", platform_logo_cdn: "https://cdn.simpleicons.org/youtube" },
//      { key: "kick_platform", platform_name: "Kick", platform_logo_cdn: "https://cdn.simpleicons.org/kick" },
// ];

export default function CreatorSetupPage({ initialValues = {}, onSubmit, onSkip, isSaving = false }) {
     const [profile, setProfile] = useState({
          profilePic: "" || null,
          email: "" || null,
          username: "" || null,
          displayName: "" || null,
          gender: "" || null,
          category: "" || null,
          about: "" || null,
          website: "" || null,
     });
     const [message, setMessage] = useState("");
     const [profileSetupCurrentStep, setProfileSetupCurrentStep] = useState(
          () => Number.parseInt(localStorage.getItem("st_profile-setup_step")) || 1,
     );
     const [activeGenderBtn, setActiveGenderBtn] = useState("");
     const [statusToastActive, setStatusToastActive] = useState(false);
     const [statusCodeInfo, setStatusToastInfo] = useState({});
     const [emailInvalid, setEmailInvalid] = useState(false);
     const [userSavedInfo, setUserSavedInfo] = useState(
          () => JSON.parse(localStorage.getItem("user_saved_info")) || {},
     );

     const updateProfile = ({ target: { name, value } }) => {
          setProfile((current) => ({ ...current, [name]: value }));
     };

     const submit = async (event) => {
          event.preventDefault();
          const { profilePic, email, username, displayName, gender, category, about, website } = profile;
          const arr = [email, username, displayName, gender, category, about, website];
          if (arr.every((elem) => elem === null)) {
               setStatusToastInfo({
                    success: false,
                    message: "Please fill out the fields to continue",
               });
               setStatusToastActive(true);
               return;
          }

          // Validation for inputs
          const isEmail = validator.isEmail(email);
          if (!isEmail) {
               setEmailInvalid("Invalid email");
               return;
          }

          const isUsernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username || "");
          if (!isUsernameValid) {
               setStatusToastInfo({
                    success: false,
                    message: "Username must be 3–20 characters and contain only letters, numbers, or underscores",
               });
               setStatusToastActive(true);
               return;
          }

          const isDisplayNameValid = Boolean(displayName?.trim()) && displayName.trim().length <= 50;
          if (!isDisplayNameValid) {
               setStatusToastInfo({
                    success: false,
                    message: "Display name is required and must be 50 characters or fewer",
               });
               setStatusToastActive(true);
               return;
          }

          const isGenderValid = ["Male", "Female", "Others"].includes(gender);
          if (!isGenderValid) {
               setStatusToastInfo({ success: false, message: "Please select a gender" });
               setStatusToastActive(true);
               return;
          }

          const isCategoryValid = Boolean(category?.trim()) && category.trim().length <= 60;
          if (!isCategoryValid) {
               setStatusToastInfo({
                    success: false,
                    message: "Creator category is required and must be 60 characters or fewer",
               });
               setStatusToastActive(true);
               return;
          }

          const isWebsiteValid = !website?.trim() || validator.isURL(website.trim(), { require_protocol: true });
          if (!isWebsiteValid) {
               setStatusToastInfo({ success: false, message: "Please enter a valid website URL including https://" });
               setStatusToastActive(true);
               return;
          }

          const LSData = {
               profilePic,
               email,
               username,
               displayName,
               gender,
               category,
               about,
               website,
          };
          localStorage.setItem("user_saved_info", JSON.stringify(LSData));
          localStorage.setItem("st_profile-setup_step", 2);
          setProfileSetupCurrentStep(2);
          setStatusToastInfo({
               success: true,
               message: "Your information has been saved",
          });
          setStatusToastActive(true);
          console.log("Saved infomation: progress=2");
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
                              onChange={updateProfile}
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

     // useEffects
     useEffect(() => {
          const keys = Object.values(userSavedInfo);
          if (!keys.length) {
               setProfileSetupCurrentStep(1);
               return;
          }

          for (const [key, value] of Object.entries(userSavedInfo)) {
               if (value === null) return;
               if (key === "gender") setActiveGenderBtn(value);
               updateProfile({
                    target: {
                         name: key,
                         value: value,
                    },
               });
          }
     }, [userSavedInfo]);
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
                                   {profile.profilePic?.length ? (
                                        <img height={25} width={25} src="" alt="Loading..." />
                                   ) : (
                                        profile.displayName?.trim()?.[0]?.toUpperCase() || "C"
                                   )}
                                   {/* <button className="st-setup-edit-avatar"></button>*/}
                              </span>
                              <div>
                                   <strong>{profile.displayName || "Your creator profile"}</strong>
                                   <small>{profile.username ? `@${profile.username}` : "Almost ready to go"}</small>
                              </div>
                         </div>
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
                                   <h1>
                                        {profileSetupCurrentStep === 1
                                             ? "Set up your profile"
                                             : "Connect your bank account"}
                                   </h1>
                                   <p className="st-setup-subtitle">
                                        Link your bank account to start receiving tips when you go live.
                                   </p>
                              </div>
                              <div className="st-setup-progress">
                                   <small>PROFILE SETUP</small>
                                   <strong>
                                        Step {profileSetupCurrentStep} <em>of</em> 2
                                   </strong>
                                   <div>
                                        <span
                                             style={{
                                                  width: profileSetupCurrentStep === 1 ? "50%" : "100%",
                                             }}
                                        />
                                   </div>
                              </div>
                         </div>
                         <div className="st-setup-form">
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
                                                            onChange={updateProfile}
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
                                                                      onClick={(event) => {
                                                                           setActiveGenderBtn(option);
                                                                           updateProfile({
                                                                                target: {
                                                                                     name: "gender",
                                                                                     value: option,
                                                                                },
                                                                           });
                                                                      }}
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
                                   {}
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
                                        <button onClick={submit} className="st-setup-submit" disabled={isSaving}>
                                             {isSaving ? "Saving..." : "Save & continue"} {!isSaving && <b>&gt;</b>}
                                        </button>
                                   </div>
                              </footer>
                         </div>
                    </section>
               </div>
               {statusToastActive && (
                    <StatusToast
                         success={statusCodeInfo.success}
                         message={statusCodeInfo.message}
                         onClose={() => {
                              setStatusToastActive(false);
                         }}
                    ></StatusToast>
               )}
          </main>
     );
}
