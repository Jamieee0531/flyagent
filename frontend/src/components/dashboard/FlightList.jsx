/**
 * @file FlightList.jsx
 * @description Renders a list of flight result cards returned by the flight-search sub-agent.
 *
 * Props:
 *   flights  {Array}    - Flight objects from the agent (SerpApi Google Flights schema).
 *   selected {object}   - Currently selected flight (used for visual highlight).
 *   onSelect {Function} - Called with the flight object when the user clicks a card or "Select".
 *
 * Falls back to Google Flights search URL if no booking_url is present on a flight.
 */
import './FlightList.css';

function getFlightBookingUrl(f) {
  const url = f.booking_url || f.booking_link || f.url || f.link;
  if (url) return url;
  const origin = f.origin || '';
  const dest = f.destination || '';
  return `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(origin)}+to+${encodeURIComponent(dest)}`;
}

function formatDuration(minutes) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function isNonstop(stops) {
  if (stops === undefined || stops === null) return null;
  if (typeof stops === 'number') return stops === 0;
  if (typeof stops === 'string') {
    const lower = stops.toLowerCase();
    return lower === 'nonstop' || lower === 'non-stop' || lower === 'direct' || lower === '0';
  }
  return false;
}

export default function FlightList({ flights, selected, onSelect }) {
  return (
    <div className="result-section">
      <span className="rs-label">Flights</span>
      <div className="result-cards">
        {flights.map((f, i) => {
          const nonstop = isNonstop(f.stops);
          const duration = f.duration || formatDuration(f.duration_minutes);
          const isSelected = selected === f;

          return (
            <div
              key={i}
              className={`result-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(f)}
            >
              {/* Header bar */}
              <div className="rc-header">
                <span className="rc-header-icon">✈️</span>
                <span className="rc-header-airline">{f.airline || 'Airline'}</span>
                {f.flight_number && (
                  <span className="rc-header-fnum">{f.flight_number}</span>
                )}
              </div>

              {/* Body */}
              <div className="rc-body">
                <div className="rc-info">
                  {/* Route */}
                  {(f.origin || f.destination) && (
                    <div className="rc-route">
                      <span className="rc-airport">{f.origin || '---'}</span>
                      <span className="rc-arrow">→</span>
                      <span className="rc-airport">{f.destination || '---'}</span>
                    </div>
                  )}

                  {/* Times + duration */}
                  <div className="rc-meta">
                    {f.departure_time && (
                      <span className="rc-meta-item">{f.departure_time}</span>
                    )}
                    {f.arrival_time && (
                      <span className="rc-meta-item">→ {f.arrival_time}</span>
                    )}
                    {duration && (
                      <span className="rc-meta-item">⏱ {duration}</span>
                    )}
                  </div>

                  {/* Stops badge */}
                  {nonstop !== null && (
                    <span className={`rc-stops-badge ${nonstop ? 'nonstop' : 'has-stops'}`}>
                      {nonstop
                        ? 'Nonstop'
                        : (typeof f.stops === 'string' ? f.stops : `${f.stops} stop(s)`)}
                    </span>
                  )}
                </div>

                {/* Price + actions */}
                <div className="rc-right">
                  <span className="rc-price">{f.price || ''}</span>
                  <div className="rc-actions">
                    <button
                      className="rc-btn-select"
                      onClick={(e) => { e.stopPropagation(); onSelect(f); }}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                    <a
                      className="rc-link"
                      href={getFlightBookingUrl(f)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Book →
                    </a>
                  </div>
                </div>
              </div>

              {/* Source */}
              {f.source && <div className="rc-source">{f.source}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
