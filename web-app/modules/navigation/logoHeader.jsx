import React from "react";
import { Box, Heading } from "grommet";
import Link from "next/link";

const LogoHeader = () => {
  const setQuery = (query) => {
    console.log(query);
  };
  return (
    <Link href="/gateway">
      <Box
        gap="small"
        margin="none"
        align="center"
        direction="row"
        focusIndicator={false}
      >
        <Heading level={3} size="medium" margin="none">
          ⚡ EnergyLink
        </Heading>
      </Box>
    </Link>
  );
};

export default LogoHeader;
