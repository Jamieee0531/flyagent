import './ResultPanel.css'

// shows search results: flights, hotels, itinerary, and travel tips
// each flight/hotel card has a save-to-favorites button
function ResultPanel({ results, favorites, onToggleFavorite }) {
  // check if an item is already in favorites
  const isFavorited = (id) => favorites.some(f => f.id === id)

  return (
    <div className="result-panel">
      <div className="result-header">
        <h3>🎉 Search Complete!</h3>
        <p>Here are the recommended options for you</p>
      </div>

      {/* Flights */}
      <section className="result-section">
        <h4>✈️ Flights</h4>
        <div className="result-cards">
          {results.flights.map(flight => (
            <div key={flight.id} className="result-card">
              <div className="card-main">
                <div className="card-title">{flight.airline}</div>
                <div className="card-detail">{flight.route}</div>
                <div className="card-detail">{flight.date}</div>
                <div className="card-price">{flight.price}</div>
              </div>
              <div className="card-actions">
                <a href={flight.link} className="action-link" target="_blank" rel="noreferrer">
                  View →
                </a>
                <button
                  className={`fav-btn ${isFavorited(flight.id) ? 'active' : ''}`}
                  onClick={() => onToggleFavorite({
                    id: flight.id,
                    type: 'flight',
                    title: flight.airline,
                    price: flight.price,
                  })}
                >
                  {isFavorited(flight.id) ? '⭐' : '☆'} Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hotels */}
      <section className="result-section">
        <h4>🏨 Hotels</h4>
        <div className="result-cards">
          {results.hotels.map(hotel => (
            <div key={hotel.id} className="result-card">
              <div className="card-main">
                <div className="card-title">{hotel.name}</div>
                <div className="card-detail">{hotel.location}</div>
                <div className="card-price">{hotel.price}</div>
              </div>
              <div className="card-actions">
                <a href={hotel.link} className="action-link" target="_blank" rel="noreferrer">
                  View →
                </a>
                <button
                  className={`fav-btn ${isFavorited(hotel.id) ? 'active' : ''}`}
                  onClick={() => onToggleFavorite({
                    id: hotel.id,
                    type: 'hotel',
                    title: hotel.name,
                    price: hotel.price,
                  })}
                >
                  {isFavorited(hotel.id) ? '⭐' : '☆'} Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Itinerary */}
      <section className="result-section">
        <h4>📋 Itinerary</h4>
        <div className="itinerary-list">
          {results.itinerary.map(item => (
            <div key={item.day} className="itinerary-item">
              <span className="day-badge">Day {item.day}</span>
              <span className="day-plan">{item.plan}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="result-section">
        <h4>⚠️ Travel Tips</h4>
        <ul className="tips-list">
          {results.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default ResultPanel
