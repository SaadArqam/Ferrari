import styled from "styled-components";

export const CircuitWrapper = styled.div`
  background: #0b0b0b;
  border-radius: 18px;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SvgWrapper = styled.div`
  width: 100%;
  max-width: 700px;

  svg {
    width: 100%;
    height: auto;
  }
`;

export const DriverDot = styled.circle`
  fill: ${({ color }) => color};
  stroke: #000;
  stroke-width: 3;
  r: 10;
`;
