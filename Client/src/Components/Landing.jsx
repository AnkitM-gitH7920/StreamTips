import React from "react";
import "../css/landing.css";
import { ArrowRight, Crown, Play, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TemplateCard from "./TemplateCard";
import { templates } from "./data";

export default function Landing() {
  return (
    <div className="site">
      <Navbar />
      <main>
        <section className="hero section">
          <div className="hero-copy">
            <div className="eyebrow"><span className="live-dot"/> BUILT FOR STREAMERS</div>
            <h1>Turn every tip<br/><em>into a moment.</em></h1>
            <p className="hero-text">Beautiful overlays, interactive alerts and unforgettable tip experiences — all in one place for creators.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/signup">Start creating <ArrowRight size={18}/></Link>
              <a className="btn btn-ghost" href="#templates"><Play size={16} fill="currentColor"/> Explore templates</a>
            </div>
            <div className="hero-proof"><div className="avatars"><span>R</span><span>A</span><span>M</span><span>+</span></div><span>Trusted by <b>12,000+</b> creators</span></div>
          </div>
          <div className="hero-visual">
            <div className="glow"/>
            <div className="stream-window">
              <div className="window-bar"><span/><span/><span/><div className="window-live">● LIVE</div></div>
              <div className="stream-scene">
                <div className="scene-grid"/>
                <div className="creator-card"><div className="creator-avatar">A</div><div><b>alexplays</b><small>LIVE NOW</small></div></div>
                <div className="tip-alert">
                  <div className="alert-icon"><Crown size={22}/></div>
                  <div><small>NEW TOP SUPPORTER</small><strong>Rohan tipped ₹2,500</strong><span>"Let's goooo 🔥"</span></div>
                </div>
                <div className="mini-chat"><span>Rohan</span> sent a <b>₹2,500</b> tip!</div>
                <div className="stream-badge"><Zap size={13}/> STREAMTIPS</div>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-strip">
          <div><strong>12K+</strong><span>Creators</span></div>
          <div><strong>480K+</strong><span>Tips sent</span></div>
          <div><strong>240+</strong><span>Templates</span></div>
          <div><strong>99.9%</strong><span>Uptime</span></div>
        </section>

        <section className="section" id="how">
          <div className="section-heading centered"><div className="eyebrow">HOW IT WORKS</div><h2>Made for the moments<br/><em>your audience remembers.</em></h2><p>Set up once. Then let your community make every stream more interactive.</p></div>
          <div className="steps">
            {[
              ["01","Create your page","Set up your creator profile and get your personal StreamTips link."],
              ["02","Pick your look","Choose an overlay that fits your stream or customize your own."],
              ["03","Share & stream","Put your link in chat, bio or description and let the moments happen."]
            ].map(([n,t,d])=><div className="step" key={n}><span className="step-number">{n}</span><h3>{t}</h3><p>{d}</p><ArrowRight size={18}/></div>)}
          </div>
        </section>

        <section className="section templates-section" id="templates">
          <div className="section-heading row"><div><div className="eyebrow">TEMPLATE LIBRARY</div><h2>Your stream.<br/><em>Your signature.</em></h2></div><Link className="text-link" to="/templates">View all templates <ArrowRight size={16}/></Link></div>
          <div className="template-grid">{templates.slice(0,4).map(t=><TemplateCard key={t.id} template={t}/>)}</div>
        </section>

        <section className="creator-cta" id="pricing">
          <div><div className="eyebrow">READY WHEN YOU ARE</div><h2>Make your next stream<br/><em>unforgettable.</em></h2></div>
          <Link className="btn btn-light" to="/signup">Create your StreamTips <ArrowRight size={18}/></Link>
        </section>
      </main>
      <Footer/>
    </div>
  );
}
