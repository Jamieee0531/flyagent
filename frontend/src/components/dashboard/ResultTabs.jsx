import { useState, useEffect } from 'react';
import FlightList from './FlightList';
import HotelList from './HotelList';
import TipsSummary from './TipsSummary';
import ItineraryDay from './ItineraryDay';
import TripMap from './TripMap';
import { createTravelPlan } from '../../api/gateway';
import './ResultTabs.css';

export default function ResultTabs({
  token,
  profile,
  results,
  onPlanSaved,
  savedPlanData,
  onClearSavedPlan,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [tips, setTips] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Sync AI agent results into local display state
  useEffect(() => {
    if (!results) return;
    if (results.flights) setFlights(results.flights);
    if (results.hotels) setHotels(results.hotels);
    if (results.itinerary) setItinerary(results.itinerary);
    if (results.tips) setTips(results.tips);
  }, [results]);

  // Load saved plan data when user clicks a Wishlist item
  useEffect(() => {
    if (!savedPlanData) return;
    setFlights(savedPlanData.flights || []);
    setHotels(savedPlanData.hotels || []);
    setItinerary(savedPlanData.itinerary || []);
    setTips(savedPlanData.tips || null);
    setSelectedFlight(savedPlanData.flights?.[0] || null);
    setSelectedHotel(savedPlanData.hotels?.[0] || null);
    setActiveTab('overview');
    setSaveMsg('');
  }, [savedPlanData]);

  const isViewingSavedPlan = !!savedPlanData;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    ...itinerary.map((d) => ({ id: `day-${d.day}`, label: `Day ${d.day}` })),
  ];

  const handleSavePlan = async () => {
    if (!selectedFlight && !selectedHotel && itinerary.length === 0) return;
    setSaving(true);
    setSaveMsg('');
    try {
      await createTravelPlan(token, {
        name: `Trip Plan - ${new Date().toLocaleDateString()}`,
        selectedFlight,
        selectedHotel,
        itinerary,
        tips,
        mbtiType: profile?.mbtiType,
        quickPick: profile?.quickPick,
      });
      setSaveMsg('Plan saved!');
      if (onPlanSaved) onPlanSaved();
    } catch (err) {
      console.error('Failed to save plan:', err);
      setSaveMsg('Failed to save plan. Please try again.');
    }
    setSaving(false);
  };

  return (
    <>
      {isViewingSavedPlan && (
        <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="btn-ghost"
            onClick={() => {
              if (onClearSavedPlan) onClearSavedPlan();
              setFlights([]);
              setHotels([]);
              setItinerary([]);
              setTips(null);
              setSelectedFlight(null);
              setSelectedHotel(null);
            }}
            style={{ fontSize: '13px', color: 'var(--accent)' }}
          >
            &larr; Back to search
          </button>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{savedPlanData.planName}</span>
        </div>
      )}

      <div className="day-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`day-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="planner-content">
        {activeTab === 'overview' ? (
          <div className="overview-content">
            {flights.length === 0 && hotels.length === 0 && !tips && (
              <div className="overview-empty">
                <p className="overview-empty-text">
                  Start chatting with the AI agent to search for flights, hotels, and build your itinerary.
                </p>
              </div>
            )}
            {flights.length > 0 && (
              <FlightList flights={flights} selected={selectedFlight} onSelect={setSelectedFlight} />
            )}
            {hotels.length > 0 && (
              <HotelList hotels={hotels} selected={selectedHotel} onSelect={setSelectedHotel} />
            )}
            {tips && <TipsSummary tips={tips} />}
          </div>
        ) : (
          <>
            <TripMap stops={itinerary.find((d) => `day-${d.day}` === activeTab)?.stops} />
            <ItineraryDay
              day={itinerary.find((d) => `day-${d.day}` === activeTab)}
              onUpdate={(updated) => {
                setItinerary((prev) =>
                  prev.map((d) => (d.day === updated.day ? updated : d))
                );
              }}
            />
          </>
        )}
      </div>

      {!isViewingSavedPlan && (selectedFlight || selectedHotel || itinerary.length > 0) && (
        <div className="save-plan-bar">
          <button
            className="btn-primary save-plan-btn"
            onClick={handleSavePlan}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Plan'}
          </button>
          {saveMsg && (
            <span
              className="save-msg"
              style={{
                marginLeft: '12px',
                fontSize: '13px',
                color: saveMsg.startsWith('Failed') ? '#c4593a' : '#4a6b5a',
              }}
            >
              {saveMsg}
            </span>
          )}
        </div>
      )}
    </>
  );
}
