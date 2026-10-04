import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, ExternalLink, Instagram, Twitch, Twitter, Youtube, Zap } from "lucide-react";
import "../css/home.css";
import Logo from "./Logo";
import Footer from "./Footer";

const CREATOR = {
    displayName: "Alex Carter",
    handle: "@alex",
    avatar: "https://i.pravatar.cc/160?img=12",
    category: "Variety Creator",
    bio: "Streamer, gamer and full-time creator. I build chaotic streams, play whatever looks fun, and occasionally pretend I know what I'm doing.",
    location: "India",
    verified: true,
};

const LINKS = [
    { label: "YouTube", value: "youtube.com/@alex", href: "#", icon: Youtube },
    { label: "Twitch", value: "twitch.tv/alex", href: "#", icon: Twitch },
    { label: "Instagram", value: "@alex", href: "#", icon: Instagram },
    { label: "Twitter", value: "@alex", href: "#", icon: Twitter },
];

const HIGHLIGHTS = [
    { title: "My latest stream", text: "Ranked grind + community games", meta: "Live every Tue, Thu & Sat" },
    { title: "Creator setup", text: "The gear and workflow behind my streams", meta: "Updated recently" },
    { title: "Community", text: "Join the conversation outside the stream", meta: "Discord & socials" },
];

export default function Home() {
    const { username } = useParams();
    const creator = { ...CREATOR, username: username || "alex" };

    return (
        <div className="home-page">
            <header className="home-nav">
                <Link to="/" className="home-brand"><Logo /></Link>
                <Link to={`/tip/${creator.username}`} className="home-nav-tip">
                    Support {creator.displayName.split(" ")[0]} <ArrowRight size={16} />
                </Link>
            </header>

            <main className="home-main">
                <section className="home-hero">
                    <div className="home-cover">
                        <div className="home-cover-glow home-cover-glow-one" />
                        <div className="home-cover-glow home-cover-glow-two" />
                        <div className="home-cover-grid" />
                    </div>

                    <div className="home-profile-row">
                        <div className="home-avatar-wrap">
                            <img src={creator.avatar} alt={creator.displayName} className="home-avatar" />
                            {creator.verified && <span className="home-verified"><CheckCircle2 size={19} /></span>}
                        </div>

                        <div className="home-profile-copy">
                            <div className="home-eyebrow"><span className="home-live-dot" />{creator.category}</div>
                            <h1>
                                {creator.displayName}
                                {creator.verified && <CheckCircle2 className="home-title-check" size={24} />}
                            </h1>
                            <p className="home-handle">{creator.handle}</p>
                        </div>

                        <Link to={`/tip/${creator.username}`} className="home-support-button">
                            <Zap size={18} fill="currentColor" /> Support creator <ArrowRight size={17} />
                        </Link>
                    </div>
                </section>

                <section className="home-content">
                    <div className="home-left">
                        <article className="home-card home-about">
                            <div className="home-section-heading">
                                <span className="home-section-kicker">About</span>
                                <h2>Welcome to my corner of StreamTips.</h2>
                            </div>
                            <p>{creator.bio}</p>
                            <div className="home-about-meta">
                                <span>📍 {creator.location}</span><span>•</span><span>Creator since 2026</span>
                            </div>
                        </article>

                        <article className="home-card">
                            <div className="home-section-heading">
                                <span className="home-section-kicker">Around the channel</span>
                                <h2>What you can find here</h2>
                            </div>

                            <div className="home-highlights">
                                {HIGHLIGHTS.map((item) => (
                                    <div className="home-highlight" key={item.title}>
                                        <div className="home-highlight-icon"><Zap size={17} /></div>
                                        <div className="home-highlight-copy">
                                            <h3>{item.title}</h3>
                                            <p>{item.text}</p>
                                            <span>{item.meta}</span>
                                        </div>
                                        <ExternalLink size={17} className="home-highlight-arrow" />
                                    </div>
                                ))}
                            </div>
                        </article>
                    </div>

                    <aside className="home-right">
                        <div className="home-card home-support-card">
                            <div className="home-support-icon"><Zap size={20} fill="currentColor" /></div>
                            <span className="home-section-kicker">Support the creator</span>
                            <h2>Enjoyed the stream?</h2>
                            <p>Send a tip and leave a message. Your support helps keep the streams going.</p>
                            <Link to={`/tip/${creator.username}`} className="home-card-button">
                                Send a tip <ArrowRight size={17} />
                            </Link>
                            <small>No account required to send a tip.</small>
                        </div>

                        <div className="home-card home-links-card">
                            <div className="home-section-heading">
                                <span className="home-section-kicker">Find me</span>
                                <h2>Elsewhere</h2>
                            </div>
                            <div className="home-social-list">
                                {LINKS.map(({ label, value, href, icon: Icon }) => (
                                    <a href={href} key={label} className="home-social-link">
                                        <span className="home-social-icon"><Icon size={17} /></span>
                                        <span><strong>{label}</strong><small>{value}</small></span>
                                        <ExternalLink size={15} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </aside>
                </section>
            </main>

            <Footer />
        </div>
    );
}
