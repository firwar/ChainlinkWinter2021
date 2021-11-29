import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Grid,
  grommet,
  Grommet,
  ResponsiveContext,
  Heading,
  WorldMap,
  Text,
  CheckBox,
} from "grommet";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { ProviderContext } from "../hooks";
import GatewayContext from "../hooks/useGateway";
import SignerContext from "../hooks/useSigner";
import { abis } from "../contracts";

// TODO we can update the place/drop when we select to show how much people are saving or something per interesting city
const placeProps = (name, color, showDrop) => ({
  name,
  color,
  ...(showDrop
    ? {
        content: (
          <Box pad={{ horizontal: "small", vertical: "xsmall" }}>
            <Text>{name}</Text>
            <Text>Energy Saved: 1MWH</Text>
            <Text>Participants: 2</Text>
          </Box>
        ),
        dropProps: {
          align: { left: "right" },
          background: { color, opacity: "strong" },
          elevation: "medium",
          margin: { left: "small" },
          round: "xsmall",
        },
      }
    : {}),
});

const Gateway = ({ address }) => {
  const { provider } = useContext(ProviderContext);
  const { signer } = useContext(SignerContext);
  const { useGateway } = useContext(GatewayContext);

  // Helpers for UX/UI
  const [loading, setLoading] = useState(false);

  // Allows us to pick places
  const [showDrops, setShowDrops] = useState(true);
  const [places, setPlaces] = useState([
    {
      location: [34.05, -118.25],
      ...placeProps("Los Angeles", "graph-2", true),
    },
  ]);

  const onSelectPlace = (place) => {
    console.log("Selected", place);
    setPlaces([{ color: "graph-1", location: place }]);
  };

  return (
    <Box align="center" pad="small">
      <WorldMap
        places={places}
        continents={[
          {
            name: "North America",
            color: "graph-1",
            onClick: () => setActive(!active),
          },
        ]}
      />
    </Box>
  );
};

export default Gateway;
