import React from 'react';
import { NavLink } from 'react-router-dom';
import { Library, Target, BookMarked, Star, Crosshair } from 'lucide-react';

const NavSidebar = () => {
  return (
    <div className="nav-sidebar lc-sidebar">
      <div className="lc-sidebar-head">Navigation</div>
      <div className="sidebar-section">
        <NavLink to="/explore" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Library size={18} />
          <span>Library</span>
        </NavLink>
        <NavLink to="/mock-interview" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Crosshair size={18} />
          <span>Quest</span>
        </NavLink>
        <NavLink to="/study" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <BookMarked size={18} />
          <span>Study Plan</span>
        </NavLink>
        <NavLink to="/challenges" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Target size={18} />
          <span>Contest</span>
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Star size={18} />
          <span>Favorites</span>
        </NavLink>
        <NavLink to="/problems" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <BookMarked size={18} />
          <span>Problem set</span>
        </NavLink>
      </div>
    </div>
  );
};

export default NavSidebar;
