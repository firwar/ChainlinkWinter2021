import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Grid,
  grommet,
  Grommet,
  ResponsiveContext,
  Heading, WorldMap, Text, CheckBox,
} from "grommet";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { ProviderContext } from "../hooks";
import GatewayContext from '../hooks/useGateway';
import SignerContext from "../hooks/useSigner";
import { abis } from "../contracts";

// TODO we can update the place/drop when we select to show how much people are saving or something per interesting city
const placeProps = (name, color, showDrop) => ({
  name,
  color,
  ...(showDrop
    ? {
      content: (
        <Box pad={{ horizontal: 'small', vertical: 'xsmall' }}>
          <Text>{name}</Text>
        </Box>
      ),
      dropProps: {
        align: { left: 'right' },
        background: { color, opacity: 'strong' },
        elevation: 'medium',
        margin: { left: 'small' },
        round: 'xsmall',
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
      location: [-33.8830555556, 151.216666667],
      ...placeProps('Sydney', 'graph-1', true),
    },
    {
      location: [42.358056, -71.063611],
      ...placeProps('Boston', 'graph-2', showDrops),
    },
    {
      location: [51.507222, -0.1275],
      ...placeProps('London', 'graph-3', showDrops),
    },
    {
      location: [-0.002222, -78.455833],
      ...placeProps('Quito', 'graph-1', showDrops),
    },
    {
      location: [34.05, -118.25],
      ...placeProps('Los Angeles', 'graph-2', true),
    },
    {
      location: [35.689722, 139.692222],
      ...placeProps('Tokyo', 'graph-3', showDrops),
    },
    {
      location: [78.22, 15.65],
      ...placeProps('Svalbard', 'graph-1', showDrops),
    },
    {
      location: [-54.801944, -68.303056],
      ...placeProps('Ushuaia', 'graph-2', showDrops),
    },
  ]);

  const onSelectPlace = (place) => {
    console.log('Selected', place);
    setPlaces([{ color: 'graph-1', location: place }]);
  };

  return (
    <Box align="center" pad="small">
      <WorldMap places={places} />
    </Box>
  )

}

export default Gateway;
