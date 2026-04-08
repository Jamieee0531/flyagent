import './FlightList.css'; // reuse result card styles

function getHotelBookingUrl(h) {
  const url = h.booking_url || h.booking_link || h.url || h.link;
  if (url) return url;
  const name = h.name || 'hotel';
  return `https://www.google.com/travel/hotels?q=${encodeURIComponent(name)}`;
}

function renderStars(hotelClass) {
  if (!hotelClass || hotelClass === 'N/A') return null;
  const num = parseInt(hotelClass, 10);
  if (isNaN(num) || num < 1 || num > 5) return null;
  return '★'.repeat(num) + '☆'.repeat(5 - num);
}

export default function HotelList({ hotels, selected, onSelect }) {
  return (
    <div className="result-section">
      <span className="rs-label">Hotels</span>
      <div className="result-cards">
        {hotels.map((h, i) => {
          const isSelected = selected === h;
          const stars = renderStars(h.hotel_class);
          const price = h.price_per_night || h.price || '';
          const rating = h.rating || h.overall_rating;

          return (
            <div
              key={i}
              className={`result-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(h)}
            >
              {/* Header bar */}
              <div className="rc-header rc-header--hotel">
                <span className="rc-header-icon">🏨</span>
                <span className="rc-header-airline">{h.name || 'Hotel'}</span>
                {stars && <span className="rc-header-fnum">{h.hotel_class}-star</span>}
              </div>

              {/* Body */}
              <div className="rc-body">
                <div className="rc-info">
                  <div className="rc-hotel-name">{h.name || 'Hotel'}</div>

                  {(h.location || h.address) && (
                    <div className="rc-hotel-location">
                      📍 {h.location || h.address}
                    </div>
                  )}

                  <div className="rc-hotel-rating">
                    {stars && <span className="rc-stars">{stars}</span>}
                    {rating && (
                      <span className="rc-rating-score">{rating}</span>
                    )}
                  </div>
                </div>

                {/* Price + actions */}
                <div className="rc-right">
                  <div>
                    <span className="rc-price">{price}</span>
                    {price && <div className="rc-price-sub">per night</div>}
                  </div>
                  <div className="rc-actions">
                    <button
                      className="rc-btn-select"
                      onClick={(e) => { e.stopPropagation(); onSelect(h); }}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                    <a
                      className="rc-link"
                      href={getHotelBookingUrl(h)}
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
              {h.source && <div className="rc-source">{h.source}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
