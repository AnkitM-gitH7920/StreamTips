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

export default function App() {
     return <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthLayout />} />
          {/* <Route path="/signup" element={<AuthLayout signup />} />*/}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/tip/:username" element={<TipPage />} />
          <Route path="/supporters" element={<Supporters />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<PageNotFound />} />
     </Routes>
}
