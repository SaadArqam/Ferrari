import React, { useEffect, useState } from "react";
import {
  AnalyticsWrapper,
  Header,
  AnalyticsGrid,
  AnalyticsCard,
  CardLabel,
  CardValue,
  Highlight,
  Loading,
  Error
} from "./Analytics.styles";

function formatLapTime(t) {
  if (!t) return "-";
  const match = t.match(/(\d+):(\d+\.\d+)/);
  return match ? `${match[1]}:${match[2].slice(0, 6)}` : t;
}

const Analytics = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`${API_URL}/api/ferrari/analytics`);
        if (!res.ok) throw new Error("Failed to load analytics");
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [API_URL]);

  if (loading) return <AnalyticsWrapper><Loading>Loading Ferrari analytics…</Loading></AnalyticsWrapper>;
  if (error) return <AnalyticsWrapper><Error>{error}</Error></AnalyticsWrapper>;

  return (
    <AnalyticsWrapper>
      <Header>
        <h1>Ferrari Analytics</h1>
        <p>Latest race performance overview</p>
      </Header>

      <AnalyticsGrid>
        <AnalyticsCard>
          <CardLabel>Season</CardLabel>
          <CardValue>{analytics.year}</CardValue>
        </AnalyticsCard>

        <AnalyticsCard>
          <CardLabel>Race</CardLabel>
          <CardValue>{analytics.circuit}</CardValue>
        </AnalyticsCard>

        <AnalyticsCard>
          <CardLabel>Drivers</CardLabel>
          <CardValue>{analytics.drivers.join(", ")}</CardValue>
        </AnalyticsCard>

        <AnalyticsCard>
          <CardLabel>Total Laps</CardLabel>
          <CardValue>{analytics.total_laps}</CardValue>
        </AnalyticsCard>

        <AnalyticsCard>
          <CardLabel>Best Lap</CardLabel>
          <CardValue>
            <Highlight>{analytics.best_lap.driver}</Highlight> —{" "}
            {formatLapTime(analytics.best_lap.lap_time)}
          </CardValue>
        </AnalyticsCard>
      </AnalyticsGrid>
    </AnalyticsWrapper>
  );
};

export default Analytics;
