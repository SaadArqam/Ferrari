import React from "react";
import styled from "styled-components";

import CircuitMap from "./Circuit/CircuitMap";
import DriverCard from "./DriverCard";

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 2rem;
  padding: 4rem;
  background: #000;
  min-height: 100vh;
`;

const Analytics = () => {
  return (
    <Layout>
      <DriverCard name="Charles Leclerc" color="#E10600" />
      <CircuitMap />
      <DriverCard name="Lewis Hamilton" color="#FFD700" />
    </Layout>
  );
};

export default Analytics;
