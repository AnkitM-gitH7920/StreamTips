import React from "react";
import "../css/dashboard-shell.css";
import { Bell, Eye, Menu, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DashboardShell({ children }) {
     return (
          <div className="app-shell">
               <Sidebar />
               <div className="dashboard-main">
                    <header className="dash-header">
                         <div className="mobile-menu">
                              <Menu size={20} />
                         </div>
                         <div className="search-box"><Search size={17} />
                              <input placeholder="Search anything..." />
                         </div>
                         <div className="header-actions">
                              <button className="icon-btn"><Bell size={18} /><i /></button>
                              <Link className="view-page" to="/tip/alexplays">
                                   <Eye size={16} /> View tip page</Link>
                              <div className="dash-avatar">A</div>
                         </div>
                    </header>{children}
               </div>
          </div>
     )
}
