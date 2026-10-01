import React from "react";
import "../css/supporters.css";
import DashboardShell from "./DashboardShell";
import { supporters } from "./data";

export default function Supporters() {
  return <DashboardShell><main className="dashboard-content"><div className="dash-title"><div><div className="eyebrow">COMMUNITY</div><h1>Your top supporters.</h1><p>The people making your stream happen.</p></div></div><div className="podium">{supporters.slice(0,3).map(s=><div className={`podium-card p-${s.rank}`} key={s.name}><span className="podium-rank">{s.rank}</span><span className="podium-avatar">{s.avatar}</span><h3>{s.name}</h3><strong>{s.amount}</strong><small>{s.tips} tips this month</small></div>)}</div><section className="panel supporter-table"><div className="panel-heading"><h2>All supporters</h2><button className="text-button">Export CSV</button></div>{supporters.map(s=><div className="supporter-row table-row" key={s.name}><span className="rank">{s.rank}</span><span className="avatar">{s.avatar}</span><div><b>{s.name}</b><small>Last tip today</small></div><span>{s.tips} tips</span><strong>{s.amount}</strong></div>)}</section></main></DashboardShell>;
}
