import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Target, Calendar, Star, TrendingUp } from 'lucide-react';

const NavSidebar = () => {
  return (
    <div className="nav-sidebar">
      <div className="sidebar-section">
        <NavLink to="/problems" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <BookOpen size={18} />
          <span>Library</span>
        </NavLink>
        <NavLink to="/challenges" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <Target size={18} />
          <span>Quest</span>
        </NavLink>
        <NavLink to="/study" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <Calendar size={18} />
          <span>Study Plan</span>
        </NavLink>
        <NavLink to="/favorites" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <Star size={18} />
          <span>Favorites</span>
        </NavLink>
      </div>
    </div>
  );
};

export default NavSidebar;
