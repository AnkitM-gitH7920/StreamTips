import React, { useState } from "react";
import "../css/template-page.css";
import { Search } from "lucide-react";
import DashboardShell from "./DashboardShell";
import TemplateCard from "./TemplateCard";
import { templates } from "./data";

export default function TemplatesPage() {
     const [filter, setFilter] = useState("All");
     const categories = ["All", "Gaming", "Minimal", "Esports", "Anime", "Funny", "Premium"];
     const filtered = filter === "All" ? templates : templates.filter(t => t.category === filter);
     return <DashboardShell><main className="dashboard-content"><div className="dash-title"><div><div className="eyebrow">TEMPLATE LIBRARY</div><h1>Find your perfect look.</h1><p>Give your stream a visual identity your community remembers.</p></div></div><div className="template-toolbar"><div className="template-search"><Search size={17} /><input placeholder="Search templates..." /></div><div className="filter-pills">{categories.map(c => <button className={filter === c ? "active" : ""} onClick={() => setFilter(c)} key={c}>{c}</button>)}</div></div><div className="template-grid library">{filtered.map(t => <TemplateCard key={t.id} template={t} />)}</div></main></DashboardShell>;
}
