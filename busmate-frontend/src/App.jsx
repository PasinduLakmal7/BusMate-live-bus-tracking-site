import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import LiveTracking from "./pages/LiveTracking";
import RoutePlanner from "./pages/RoutePlanner";
import RoutesSchedules from "./pages/RoutesSchedules";
import BusStopDetails from "./pages/BusStopDetails";
import BusDetails from "./pages/BusDetails";
import Alerts from "./pages/Alerts";
import UserDashboard from "./pages/UserDashboard";
import Favorites from "./pages/Favorites";
import SmartPredictions from "./pages/SmartPredictions";
import CrowdStatus from "./pages/CrowdStatus";
import HelpSupport from "./pages/HelpSupport";

// Layouts
import Layout from "./components/layout/Layout";

const App = () => {
  return (
    <div className="font-sans">
      <Layout>
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<LiveTracking />} />
          <Route path="/planner" element={<RoutePlanner />} />
          <Route path="/routes" element={<RoutesSchedules />} />
          
          {/* Detail Routes */}
          <Route path="/stop/:id" element={<BusStopDetails />} />
          <Route path="/bus/:id" element={<BusDetails />} />
          
          {/* User Routes */}
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/favorites" element={<Favorites />} />
          
          {/* Feature Routes */}
          <Route path="/predictions" element={<SmartPredictions />} />
          <Route path="/crowd-status" element={<CrowdStatus />} />
          
          {/* Info Routes */}
          <Route path="/help" element={<HelpSupport />} />
        </Routes>
      </Layout>
    </div>
  );
};

export default App;
