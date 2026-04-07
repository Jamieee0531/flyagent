import './ResultPanel.css'

function ResultPanel({ results, favorites, onToggleFavorite }) {
  const isFavorited = (id) => favorites.some(f => f.id === id)

  // fallback: if results is raw text (JSON parse failed), show as plain text
  if (results.rawText) {
    return (
      <div className="result-panel">
        <div className="result-header">
          <h3>Search Complete!</h3>
        </div>
        <section className="result-section">
          <div className="raw-result-text">{results.rawText}</div>
        </section>
      </div>
    )
  }

  const hasAnyData = (results.flights?.length > 0) || (results.hotels?.length > 0) ||
                     (results.itinerary?.length > 0) || (results.tips?.length > 0)

  return (
    <div className="result-panel">
      <div className="result-header">
        <h3>{hasAnyData ? 'Search Results' : 'Searching...'}</h3>
        {hasAnyData && <p>Results appear as each agent completes</p>}
      </div>

      {/* Flights */}
      {results.flights && results.flights.length > 0 && (
        <section className="result-section">
          <h4>Flights</h4>
          <div className="result-cards">
            {results.flights.map((flight, i) => {
              const id = `f-${i}`
              return (
                <div key={id} className="result-card">
                  <div className="card-main">
                    <div className="card-title">{flight.airline} {flight.flight_number}</div>
                    <div className="card-detail">{flight.origin} → {flight.destination}</div>
                    <div className="card-detail">Outbound: {flight.departure_time} → {flight.arrival_time}</div>
                    {flight.return_date && <div className="card-detail">Return: {flight.return_date}</div>}
                    {flight.stops && <div className="card-detail">{flight.stops}</div>}
                    {flight.duration_minutes && <div className="card-detail">Duration: {Math.floor(flight.duration_minutes / 60)}h {flight.duration_minutes % 60}m</div>}
                    <div className="card-price">{flight.price} {flight.currency} <span className="price-note">(round trip, all passengers)</span></div>
                    {flight.source && <div className="card-source">via {flight.source}</div>}
                  </div>
                  <div className="card-actions">
                    {flight.booking_link && (
                      <a href={flight.booking_link} className="action-link" target="_blank" rel="noreferrer">
                        Book →
                      </a>
                    )}
                    <button
                      className={`fav-btn ${isFavorited(id) ? 'active' : ''}`}
                      onClick={() => onToggleFavorite({
                        id,
                        type: 'flight',
                        title: `${flight.airline} ${flight.flight_number}`,
                        price: flight.price,
                      })}
                    >
                      {isFavorited(id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Hotels */}
      {results.hotels && results.hotels.length > 0 && (
        <section className="result-section">
          <h4>Hotels</h4>
          <div className="result-cards">
            {results.hotels.map((hotel, i) => {
              const id = `h-${i}`
              return (
                <div key={id} className="result-card">
                  <div className="card-main">
                    <div className="card-title">{hotel.name}</div>
                    <div className="card-detail">{hotel.location}</div>
                    <div className="card-price">{hotel.price_per_night}/night {hotel.currency} <span className="price-note">(per room)</span></div>
                    {hotel.rating && <div className="card-detail">Rating: {hotel.rating}</div>}
                    {hotel.source && <div className="card-source">via {hotel.source}</div>}
                  </div>
                  <div className="card-actions">
                    {hotel.booking_link && (
                      <a href={hotel.booking_link} className="action-link" target="_blank" rel="noreferrer">
                        Book →
                      </a>
                    )}
                    <button
                      className={`fav-btn ${isFavorited(id) ? 'active' : ''}`}
                      onClick={() => onToggleFavorite({
                        id,
                        type: 'hotel',
                        title: hotel.name,
                        price: hotel.price_per_night,
                      })}
                    >
                      {isFavorited(id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Itinerary */}
      {results.itinerary && results.itinerary.length > 0 && (
        <section className="result-section">
          <h4>Itinerary</h4>
          <div className="itinerary-list">
            {results.itinerary.map((item, i) => (
              <div key={item.day || i} className="itinerary-item">
                <div className="day-header">
                  <span className="day-badge">Day {item.day}</span>
                  <span className="day-theme">{item.theme}</span>
                </div>
                <div className="day-schedule">
                  <div><strong>Morning:</strong> {item.morning}</div>
                  <div><strong>Afternoon:</strong> {item.afternoon}</div>
                  <div><strong>Evening:</strong> {item.evening}</div>
                  {item.transport_notes && (
                    <div className="transport-note">Transport: {item.transport_notes}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tips */}
      {results.tips && results.tips.length > 0 && (
        <section className="result-section">
          <h4>Travel Tips</h4>
          {results.tips.map((cat, i) => (
            <div key={i} className="tip-category">
              <h5>{cat.category}</h5>
              <ul className="tips-list">
                {cat.tips.map((tip, j) => (
                  <li key={j}>{tip}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

export default ResultPanel
