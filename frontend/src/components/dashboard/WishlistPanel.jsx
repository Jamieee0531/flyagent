import { useEffect, useState } from 'react';
import { listTravelPlans, deleteTravelPlan } from '../../api/gateway';
import './WishlistPanel.css';

export default function WishlistPanel({ token, refreshKey, onSelectPlan }) {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (!token) return;
    listTravelPlans(token)
      .then((d) => setPlans(d?.plans || []))
      .catch((err) => {
        console.error('Failed to load travel plans:', err);
      });
  }, [token, refreshKey]);

  const handleDelete = async (e, planId) => {
    e.stopPropagation();
    try {
      await deleteTravelPlan(token, planId);
      setPlans((prev) => prev.filter((p) => p._id !== planId));
    } catch (err) {
      console.error('Failed to delete plan:', err);
    }
  };

  return (
    <div className="profile-section">
      <span className="ps-label">Saved Plans</span>
      {plans.length === 0 && (
        <p className="wishlist-empty">No saved plans yet. Chat with the agent to create one!</p>
      )}
      {plans.map((plan, i) => (
        <div
          key={plan._id}
          className="wishlist-item"
          onClick={() => onSelectPlan && onSelectPlan(plan._id)}
        >
          <div
            className="wi-swatch"
            style={{ background: i === 0 ? 'rgba(196,89,58,0.1)' : 'rgba(184,135,60,0.1)' }}
          >
            &#9992;
          </div>
          <div className="wi-text">
            <span className="wi-name">{plan.name}</span>
            <span className={`wi-status ${i === 0 ? 'ws-alert' : 'ws-monitor'}`}>
              {new Date(plan.createdAt).toLocaleDateString()}
            </span>
          </div>
          <button
            className="wi-delete-btn"
            onClick={(e) => handleDelete(e, plan._id)}
            title="Delete plan"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
