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

export default function App() {
     return (
          <Routes>
               <Route path="/" element={<Landing />} />
               <Route path="/home/:id" element={<CreatorPage />}></Route>
               <Route path="/login" element={<AuthLayout />} />
               <Route path="/me" element={<Dashboard />} />
               <Route path="/me/templates" element={<TemplatesPage />} />
               <Route path="/tip/:username" element={<TipPage />} />
               <Route path="/me/supporters" element={<Supporters />} />
               <Route path="/me/settings" element={<SettingsPage />} />
               <Route path="*" element={<PageNotFound />} />
          </Routes>
     );
}

// {
//      /* <Route path="/signup" element={<AuthLayout signup />} />*/
// }
