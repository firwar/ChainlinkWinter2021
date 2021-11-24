import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Grid,
  grommet,
  Grommet,
  ResponsiveContext,
  Heading,
} from "grommet";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { ProviderContext } from "../hooks";
import GatewayContext from '../hooks/useGateway';
import SignerContext from "../hooks/useSigner";
import { abis } from "../contracts";

const Gateway = ({ address }) => {

  const { provider } = useContext(ProviderContext);
  const { signer } = useContext(SignerContext);
  const { useGateway } = useContext(GatewayContext);

  // Helpers for UX/UI
  const [loading, setLoading] = useState(false);

}

export default Gateway;
