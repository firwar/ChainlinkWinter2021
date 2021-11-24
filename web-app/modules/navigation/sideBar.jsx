import {Box, Button, Grommet, Nav, Text} from "grommet";
import {useState} from "react";

const SidebarButton = ({ label, ...rest }) => (
  <Button plain {...rest}>
    {({ hover }) => (
      <Box
        background={hover ? 'accent-1' : undefined}
        pad={{ horizontal: 'large', vertical: 'medium' }}
      >
        <Text size="large">{label}</Text>
      </Box>
    )}
  </Button>
);

const SidebarNav = () => {
  const [active, setActive] = useState();
  return (
    <Box>
      {['Leaderboard', 'Available Campaigns', 'My Progress'].map((name) => (
        <Button key={name} href={name} hoverIndicator>
          <Box pad={{ horizontal: 'medium', vertical: 'small' }}>
            <Text>{name}</Text>
          </Box>
        </Button>
      ))}
    </Box>
  );
};

export default SidebarNav;
