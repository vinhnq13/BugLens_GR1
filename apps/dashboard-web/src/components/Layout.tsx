import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Bug, Settings } from 'lucide-react';

export const Layout: React.FC = () => {
  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Bug size={24} />
          BugLens
        </div>
        <nav className="sidebar-nav">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink
            to="/issues"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Bug size={18} />
            Issues
          </NavLink>
          <div className="nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <Settings size={18} />
            Settings
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            Workspace / BugLens GR1
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Alice Tester</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              A
            </div>
          </div>
        </header>
        <div className="content-scroll">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
