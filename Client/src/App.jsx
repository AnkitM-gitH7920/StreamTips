import React from "react";
import { Route, Routes } from "react-router-dom";
import Landing from "./Components/Landing";
import AuthLayout from "./Components/AuthLayout";
import Dashboard from "./Components/Dashboard";
import TemplatesPage from "./Components/TemplatesPage";
import TipPage from "./Components/TipPage";
import Supporters from "./Components/Supporters";
import SettingsPage from "./Components/SettingsPage";
import PageNotFound from "./Components/PageNotFound";
import CreatorPage from "./Components/CreatorPage";
import CreatorSetupPage from "./Components/CreatorSetupPage";

export default function App() {
     return (
          <Routes>
               {/* Globally accessible routes*/}
               <Route path="/" element={<Landing />} />
               <Route path="/home/:id" element={<CreatorPage />}></Route>
               <Route path="/login" element={<AuthLayout />} />
               <Route path="/tip/:username" element={<TipPage />} />
               <Route path="*" element={<PageNotFound />} />

               {/* Creator accessible routes*/}
               <Route path="/me" element={<Dashboard />} />
               <Route path="/me/settings" element={<SettingsPage />} />
               <Route path="/me/templates" element={<TemplatesPage />} />
               <Route path="/me/supporters" element={<Supporters />} />
               <Route path="/me/setup" element={<CreatorSetupPage />}></Route>
               {/* <Route path="/me/settings/profile" element={<ManageProfile />}></Route>*/}
          </Routes>
     );
}

// {
//      /* <Route path="/signup" element={<AuthLayout signup />} />*/
// }
