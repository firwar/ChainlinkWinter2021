import { Anchor, Box, Button, Grommet, Nav, Sidebar, Text } from "grommet";
import { useRouter } from "next/router";

const navMap = {
  Home: "gateway",
  Leaderboard: "leaderboard",
  "My Progress": "pact",
};

const SidebarFooter = () => (
  <Nav gap="small">
    <Button key="linknest" hoverIndicator>
      <Box pad={{ horizontal: "medium", vertical: "small" }}>
        <Anchor href="https://nestservices.google.com/partnerconnections/52ff6eef-bce8-4944-8dab-0209bfc706a9/auth?redirect_uri=https://www.google.com&access_type=offline&prompt=consent&client_id=915332454293-dls7gb1u50bchnn78tsvgsf5nts8er64.apps.googleusercontent.com&response_type=code&scope=https://www.googleapis.com/auth/sdm.service">
          <Text>Link Nest</Text>
        </Anchor>
      </Box>
    </Button>
  </Nav>
);

const SidebarNav = () => {
  const router = useRouter();

  const onClick = (route) => {
    router.push(route);
  };
  return (
    <Box direction="row" height={{ min: "100%" }}>
      <Sidebar footer={<SidebarFooter />}>
        {Object.keys(navMap).map((name) => (
          <Button
            key={name}
            onClick={() => onClick(navMap[name])}
            hoverIndicator
          >
            <Box pad={{ horizontal: "medium", vertical: "small" }}>
              <Text>{name}</Text>
            </Box>
          </Button>
        ))}
      </Sidebar>
    </Box>
  );
};

export default SidebarNav;
