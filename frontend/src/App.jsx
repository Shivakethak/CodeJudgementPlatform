import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import TopNavbar from './components/TopNavbar';
import NavSidebar from './components/NavSidebar';

import ProblemList from './pages/ProblemList';
import Workspace from './pages/Workspace';
import Auth from './pages/Auth';
import Challenges from './pages/Challenges';
import Explore from './pages/Explore';
import Discuss from './pages/Discuss';
import Interview from './pages/Interview';
import Store from './pages/Store';
import StudyPlan from './pages/StudyPlan';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <TopNavbar />
          <div className="main-layout">
            <NavSidebar />
            <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
              <Routes>
              <Route path="/" element={<ProblemList />} />
              <Route path="/problem/:id" element={<Workspace />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/discuss" element={<Discuss />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/store" element={<Store />} />
              <Route path="/study" element={<StudyPlan />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/problems" element={<ProblemList />} />
            </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
