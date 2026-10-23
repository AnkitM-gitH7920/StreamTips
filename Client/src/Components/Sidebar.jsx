import React from "react";
import "../css/sidebar.css";
import { ChevronDown, LayoutDashboard, Settings, Sparkles, Trophy, Zap } from "lucide-react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo";

export default function Sidebar() {
     const items = [
          ["Overview", "/me", LayoutDashboard],
          ["Templates", "/me/templates", Sparkles],
          ["Tip page", "/tip/alexplays", Zap],
          ["Supporters", "/me/supporters", Trophy],
     ];
     return (
          <aside className="sidebar">
               <Logo />
               <nav>
                    {items.map(([label, to, Icon]) => (
                         <NavLink key={label} to={to} end className={({ isActive }) => (isActive ? "active" : "")}>
                              <Icon size={18} />
                              {label}
                         </NavLink>
                    ))}
               </nav>
               <div className="sidebar-bottom">
                    <NavLink to="/me/settings">
                         <Settings size={18} />
                         Settings
                    </NavLink>
                    <div className="user-mini">
                         <span>A</span>
                         <div>
                              <b>Alex Morgan</b>
                              <small>@alexplays</small>
                         </div>
                         <ChevronDown size={15} />
                    </div>
               </div>
          </aside>
     );
}
