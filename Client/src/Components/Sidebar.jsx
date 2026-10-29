import React from "react";
import "../css/sidebar.css";
import { ChevronDown, TableOfContents, Settings, LayoutPanelTop, Trophy, Wallet  } from "lucide-react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo";

export default function Sidebar() {
     const items = [
          ["Overview", "/me", TableOfContents],
          ["Templates", "/me/templates", LayoutPanelTop],
          ["Supporters", "/me/supporters", Trophy],
          ["Tip page", "/tip/alexplays", Wallet],
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
