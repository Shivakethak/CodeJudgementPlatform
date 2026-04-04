import React, { Suspense, lazy, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import TopNavbar from './components/TopNavbar';
import NavSidebar from './components/NavSidebar';
import RightSidebar from './components/RightSidebar';

const ProblemList = lazy(() => import('./pages/ProblemList'));
const Workspace = lazy(() => import('./pages/Workspace'));
const Auth = lazy(() => import('./pages/Auth'));
const Contests = lazy(() => import('./pages/Contests'));
const ContestRoom = lazy(() => import('./pages/ContestRoom'));
const Explore = lazy(() => import('./pages/Explore'));
const Discuss = lazy(() => import('./pages/Discuss'));
const Interview = lazy(() => import('./pages/Interview'));
const Store = lazy(() => import('./pages/Store'));
const StudyPlan = lazy(() => import('./pages/StudyPlan'));
const StudyPlanDetail = lazy(() => import('./pages/StudyPlanDetail'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Profile = lazy(() => import('./pages/Profile'));
const MockInterview = lazy(() => import('./pages/MockInterview'));

const MemoTopNavbar = memo(TopNavbar);
const MemoNavSidebar = memo(NavSidebar);
const MemoRightSidebar = memo(RightSidebar);

const AppShell = memo(() => (
  <div className="app-container">
    <MemoTopNavbar />
    <div className="main-layout">
      <MemoNavSidebar />
      <div className="lc-main-scroll lc-main-with-panels">
        <Suspense fallback={<div className="lc-page lc-page--center lc-muted">Loading…</div>}>
          <Outlet />
        </Suspense>
      </div>
      <MemoRightSidebar />
    </div>
  </div>
));

const LoginLayout = memo(() => (
  <div className="app-container">
    <MemoTopNavbar />
    <div className="lc-login-body">
      <Suspense fallback={<div className="lc-page lc-page--center lc-muted">Loading…</div>}>
        <Auth />
      </Suspense>
    </div>
  </div>
));

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginLayout />} />
          <Route element={<AppShell />}>
            <Route index element={<ProblemList />} />
            <Route path="problem/:id" element={<Workspace />} />
            <Route path="challenges" element={<Contests />} />
            <Route path="challenges/:id" element={<ContestRoom />} />
            <Route path="explore" element={<Explore />} />
            <Route path="discuss" element={<Discuss />} />
            <Route path="interview" element={<Interview />} />
            <Route path="store" element={<Store />} />
            <Route path="study" element={<StudyPlan />} />
            <Route path="study/:slug" element={<StudyPlanDetail />} />
            <Route path="mock-interview" element={<MockInterview />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="profile" element={<Profile />} />
            <Route path="problems" element={<ProblemList />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
