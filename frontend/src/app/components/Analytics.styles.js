import styled from "styled-components";

export const AnalyticsWrapper = styled.section`
  width: 100%;
  min-height: 100vh;
  padding: 4rem 6%;
  background: #0b0b0b;
  color: #ffffff;
  font-family: "Inter", sans-serif;
`;

export const Header = styled.div`
  margin-bottom: 3rem;

  h1 {
    font-size: 3rem;
    font-weight: 700;
    color: #e10600; /* Ferrari Red */
    letter-spacing: -0.5px;
  }

  p {
    margin-top: 0.5rem;
    font-size: 1rem;
    color: #b3b3b3;
  }
`;

export const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
`;

export const AnalyticsCard = styled.div`
  background: linear-gradient(180deg, #141414, #0f0f0f);
  border-radius: 14px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(225, 6, 0, 0.6);
    box-shadow: 0 20px 40px rgba(225, 6, 0, 0.15);
  }
`;

export const CardLabel = styled.span`
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #9b9b9b;
  margin-bottom: 0.75rem;
`;

export const CardValue = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: #ffffff;
`;

export const Highlight = styled.span`
  color: #e10600;
`;

export const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  margin: 3rem 0;
`;

export const Loading = styled.div`
  font-size: 1.2rem;
  color: #888;
`;

export const Error = styled.div`
  font-size: 1.1rem;
  color: #ff4d4d;
`;
