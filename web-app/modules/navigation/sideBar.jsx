import {Box, Button, Grommet, Nav, Text} from "grommet";
import { useRouter } from "next/router";
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

const navMap = {
  'Home': 'gateway',
  'Leaderboard': 'leaderboard',
  'Available Campaigns': 'listings',
  'My Progress': 'pact'
}

const SidebarNav = () => {
  const router = useRouter();

  const onClick = (route) => {
    router.push(route)
  }
  return (
    <Box>
      {Object.keys(navMap).map((name) => (
        <Button key={name} onClick={() => onClick(navMap[name])} hoverIndicator>
          <Box pad={{ horizontal: 'medium', vertical: 'small' }}>
            <Text>{name}</Text>
          </Box>
        </Button>
      ))}
    </Box>
  );
};

export default SidebarNav;
