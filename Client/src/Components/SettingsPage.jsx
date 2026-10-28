import React from "react";
import "../css/settings-page.css";
import { ArrowRight } from "lucide-react";
import DashboardShell from "./DashboardShell";

export default function SettingsPage() {
  return <DashboardShell><main className="dashboard-content"><div className="dash-title"><div><div className="eyebrow">ACCOUNT</div><h1>Settings</h1><p>Manage your creator profile and experience.</p></div></div><section className="panel settings-panel">{["Profile","Tip page","Overlay settings","Notifications","Security"].map((x,i)=><div className="setting-row" key={x}><div><h3>{x}</h3><p>{i===0?"Update your public creator information.":i===1?"Customize your public tip page.":i===2?"Control alerts, animations and sounds.":i===3?"Choose which notifications you receive.":"Manage your account security."}</p></div><button className="btn btn-outline">Manage <ArrowRight size={15}/></button></div>)}</section></main></DashboardShell>;
}
