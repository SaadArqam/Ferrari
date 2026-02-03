import styled from "styled-components";

const Card = styled.div`
  background: #111;
  border-radius: 14px;
  padding: 1.5rem;
  min-width: 220px;
  color: #fff;
`;

const Name = styled.h3`
  color: ${({ color }) => color};
  margin-bottom: 0.5rem;
`;

const Stat = styled.p`
  font-size: 0.9rem;
  color: #bbb;
`;

const DriverCard = ({ name, color }) => {
  return (
    <Card>
      <Name color={color}>{name}</Name>
      <Stat>Position: —</Stat>
      <Stat>Lap Time: —</Stat>
      <Stat>Gap: —</Stat>
    </Card>
  );
};

export default DriverCard;
