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
  const [calendarAdding, setCalendarAdding] = useState(false);
  const [calendarMsg, setCalendarMsg] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tripStartDate, setTripStartDate] = useState('');

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

  const handleAddToCalendar = async () => {
    if (!tripStartDate || itinerary.length === 0) return;
    setCalendarAdding(true);
    setCalendarMsg('');
    try {
      const FASTAPI = import.meta.env.VITE_GATEWAY_WS_URL?.replace('ws://', 'http://') || 'http://localhost:8001';
      const destination = profile?.quickPick?.departure || 'Trip';
      const res = await fetch(`${FASTAPI}/api/calendar/add-trip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, itinerary, start_date: tripStartDate, destination }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');
      setCalendarMsg(`✓ ${data.created} day(s) added to Google Calendar`);
      setShowDatePicker(false);
    } catch (err) {
      setCalendarMsg(`Failed: ${err.message}`);
    }
    setCalendarAdding(false);
  };

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
          <button className="btn-primary save-plan-btn" onClick={handleSavePlan} disabled={saving}>
            {saving ? 'Saving...' : 'Save Plan'}
          </button>

          {itinerary.length > 0 && !showDatePicker && (
            <button
              className="btn-ghost save-plan-btn"
              style={{ marginLeft: 8 }}
              onClick={() => setShowDatePicker(true)}
            >
              📅 Add to Calendar
            </button>
          )}

          {showDatePicker && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
              <input
                type="date"
                value={tripStartDate}
                onChange={(e) => setTripStartDate(e.target.value)}
                style={{ fontSize: 13, padding: '2px 6px', borderRadius: 6, border: '1px solid #ccc' }}
              />
              <button
                className="btn-primary save-plan-btn"
                onClick={handleAddToCalendar}
                disabled={calendarAdding || !tripStartDate}
                style={{ padding: '4px 12px' }}
              >
                {calendarAdding ? 'Adding...' : 'Confirm'}
              </button>
              <button className="btn-ghost" onClick={() => setShowDatePicker(false)} style={{ fontSize: 13 }}>
                Cancel
              </button>
            </span>
          )}

          {(saveMsg || calendarMsg) && (
            <span className="save-msg" style={{
              marginLeft: 12, fontSize: 13,
              color: (saveMsg || calendarMsg).startsWith('Failed') ? '#c4593a' : '#4a6b5a',
            }}>
              {calendarMsg || saveMsg}
            </span>
          )}
        </div>
      )}
    </>
  );
}
