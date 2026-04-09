import { useCallback, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTravelPlan } from '../api/gateway';
import ProfilePanel from '../components/dashboard/ProfilePanel';
import WishlistPanel from '../components/dashboard/WishlistPanel';
import ResultTabs from '../components/dashboard/ResultTabs';
import ChatPanel from '../components/dashboard/ChatPanel';
import './DashboardPage.css';

export default function DashboardPage() {
  const { profile, token, logout } = useAuth();
  const [wishlistVersion, setWishlistVersion] = useState(0);
  const [savedPlanData, setSavedPlanData] = useState(null);
  const handlePlanSaved = useCallback(() => {
    setWishlistVersion((v) => v + 1);
  }, []);
  const handleSelectPlan = useCallback(async (planId) => {
    try {
      const data = await getTravelPlan(token, planId);
      const plan = data?.plan || data;
      setSavedPlanData({
        flights: plan.selectedFlight ? [plan.selectedFlight] : [],
        hotels: plan.selectedHotel ? [plan.selectedHotel] : [],
        itinerary: plan.itinerary || [],
        tips: plan.tips || null,
        planName: plan.name || 'Saved Plan',
      });
    } catch (err) {
      console.error('Failed to load plan:', err);
    }
  }, [token]);

  return (
    <div className="dashboard">
      <div className="topnav">
        <div className="logo">
          <span className="logo-mark">N</span>
          Nomie
        </div>
        <div className="nav-divider" />
        <div>
          <div className="nav-trip-name">Travel Planner</div>
          <div className="nav-trip-sub">AI-powered itinerary</div>
        </div>
        <div className="nav-right">
          <div className="agent-status">
            <span className="pulse-dot" />
            Agent ready
          </div>
          <button className="nav-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="app-body">
        <div className="sidebar">
          <ProfilePanel profile={profile} />
          <WishlistPanel token={token} refreshKey={wishlistVersion} onSelectPlan={handleSelectPlan} />
        </div>
        <div className="planner">
          <ResultTabs token={token} profile={profile} onPlanSaved={handlePlanSaved} savedPlanData={savedPlanData} onClearSavedPlan={() => setSavedPlanData(null)} />
        </div>
        <div className="chat-column">
          <ChatPanel token={token} profile={profile} />
        </div>
      </div>
    </div>
  );
}
