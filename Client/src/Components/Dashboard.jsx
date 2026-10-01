import React from "react";
import "../css/dashboard.css";
import { ArrowRight, Crown, Eye, Sparkles, Trophy, Upload, Users, Zap } from "lucide-react";
import Button from "./Button";
import DashboardShell from "./DashboardShell";
import TemplatePreview from "./TemplatePreview";
import { supporters } from "./data";

export default function Dashboard() {
     return (
          <DashboardShell>
               <main className="dashboard-content">
                    <div className="dash-title"><div>
                         <div className="eyebrow">THURSDAY, OCTOBER 1</div>
                         <h1>Good morning, Alex.</h1>
                         <p>Here's what's happening with your stream.</p>
                    </div><Button><Upload size={16} /> Share tip link</Button>
                    </div>
                    <div className="metric-grid">
                         {
                              [["Total tips", "₹48,620", "+18.4%", Zap],
                              ["This month", "₹12,850", "+24.8%", Sparkles],
                              ["Supporters", "184", "+12.2%", Users],
                              ["Top supporter", "Rohan", "₹12,500", Crown]].map(([a, b, c, I]) =>
                                   <div className="metric" key={a}>
                                        <div className="metric-top">
                                             <span>{a}</span>
                                             <div><I size={17}></I></div>
                                        </div>
                                        <strong>{b}</strong>
                                        <small className={c.startsWith("+") ? "positive" : ""}>{c}</small>
                                   </div>)
                         }
                    </div>
                    <div className="dash-columns">
                         <section className="panel">
                              <div className="panel-heading"><div>
                                   <h2>Recent tips</h2>
                                   <p>Your latest community support.</p>
                              </div>
                                   <button className="text-button">View all <ArrowRight size={15} /></button>
                              </div>
                              <div className="tip-list">{[
                                   ["Rohan", "₹2,500", "Let's gooo 🔥", "2 min ago"],
                                   ["Maya", "₹1,000", "Love the new overlay!", "18 min ago"],
                                   ["Arjun", "₹750", "Keep grinding!", "42 min ago"],
                                   ["Karan", "₹500", "W stream", "1 hr ago"]
                              ].map(([n, a, m, t]) =>
                                   <div className="tip-row" key={n}>
                                        <span className="avatar">{n[0]}</span>
                                        <div className="tip-who">
                                             <b>{n}</b>
                                             <span>{m}</span>
                                        </div><p>{m}</p>
                                        <small>{t}</small>
                                   </div>
                              )}
                              </div>
                         </section>
                         <section className="panel">
                              <div className="panel-heading"><div>
                                   <h2>Top supporters</h2>
                                   <p>This month</p>
                              </div><Trophy size={19} /></div>
                              <div className="supporter-list">{supporters.slice(0, 4).map(s => <div className={`supporter-row rank-${s.rank}`} key={s.name}>
                                   <span className="rank">{s.rank}</span>
                                   <span className="avatar">{s.avatar}</span>
                                   <div><b>{s.name}</b><small>{s.tips} tips</small></div>
                                   <strong>{s.amount}</strong>
                              </div>
                              )}
                              </div>
                         </section>
                    </div>
                    <section className="panel overlay-panel">
                         <div className="panel-heading"><div>
                              <h2>Current overlay</h2>
                              <p>Emerald Pulse · Active on your stream</p>
                         </div>
                              <div><button className="icon-btn"><Eye size={17} /></button>
                                   <Button variant="outline">Customize</Button>
                              </div>
                         </div>
                         <div className="overlay-demo">
                              <TemplatePreview tone="emerald" />
                              <div className="overlay-stats">
                                   <span><i /> Connected</span><b>Preview mode</b>
                              </div>
                         </div>
                    </section>
               </main>
          </DashboardShell>
     )
}
