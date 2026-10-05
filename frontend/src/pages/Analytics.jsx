import { useState, useEffect } from "react";
import { getAnalytics } from "../services/api";

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res))
      .catch((e) => console.error(e));
  }, []);

  const stats = data?.summary || {
    total_conversations: 168,
    active_conversations: 14,
    escalation_rate_percent: 12.5,
    csat_score: 4.8,
  };

  const sentiments = data?.sentiment_distribution || { happy: 42, neutral: 85, frustrated: 24, angry: 9 };
  const intents = data?.intent_distribution || { order_status: 34, delayed_delivery: 28, refund: 18, duplicate_payment: 12, login_issue: 15 };

  return (
    <div className="view-container animate-fade-in">
      <div className="view-header">
        <div>
          <h2 className="view-title">Analytics</h2>
          <p className="view-subtitle">Platform performance metrics, customer sentiment, and intent analytics.</p>
        </div>
      </div>

      <div className="metrics-grid-4">
        <div className="metric-block">
          <span className="metric-lbl">Total Conversations</span>
          <span className="metric-val">{stats.total_conversations}</span>
        </div>
        <div className="metric-block">
          <span className="metric-lbl">Escalation Rate</span>
          <span className="metric-val">{stats.escalation_rate_percent}%</span>
        </div>
        <div className="metric-block">
          <span className="metric-lbl">Avg Response Time</span>
          <span className="metric-val">1.4s</span>
        </div>
        <div className="metric-block">
          <span className="metric-lbl">CSAT Rating</span>
          <span className="metric-val text-success">{stats.csat_score} / 5.0</span>
        </div>
      </div>

      <div className="analytics-two-col section-margin-top">
        {/* Sentiment Breakdown */}
        <div className="content-card">
          <h3>Customer Sentiment Distribution</h3>
          <div className="progress-list">
            {Object.entries(sentiments).map(([s, count]) => {
              const total = 160;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={s} className="progress-row">
                  <div className="row-meta">
                    <span className="lbl">{s.toUpperCase()}</span>
                    <span className="val">{count} cases ({pct}%)</span>
                  </div>
                  <div className="bar-bg">
                    <div className={`bar-fill fill-${s}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intent Distribution */}
        <div className="content-card">
          <h3>Customer Intent Categories</h3>
          <div className="progress-list">
            {Object.entries(intents).map(([intent, count]) => (
              <div key={intent} className="progress-row">
                <div className="row-meta">
                  <span className="lbl">{intent}</span>
                  <span className="val">{count}</span>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill fill-primary" style={{ width: `${Math.min(100, count * 2.5)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
