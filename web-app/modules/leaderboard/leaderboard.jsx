import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Grid,
  grommet,
  Grommet,
  ResponsiveContext,
  Heading,
  DataChart,
  Text,
  Spinner,
  Button,
  DataTable,
  Meter,
} from "grommet";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { ProviderContext } from "../hooks";
import SignerContext from "../hooks/useSigner";
import { abis } from "../contracts";
import PactContext from "../hooks/usePact";
import moment from "moment";

const reducer = (previousValue, currentValue) => previousValue + currentValue;

const Leaderboard = ({ address }) => {
  address = "0x757341e5FD0E5604bF183b5CaA2d8144059c727b";
  // Web3
  const { provider } = useContext(ProviderContext);
  const { signer } = useContext(SignerContext);
  const { pact, setPact } = useContext(PactContext);

  // Helpers for UX/UI
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([]);

  const getLeaderboard = async () => {
    setLoading(true);

    // TODO:
    const participants = await pact.connect(signer).getParticipants();
    console.log(participants);

    let complianceData = [];
    // Populate compliance array
    for (let i = 0; i < participants.length; i++) {
      complianceData[i] = (
        await pact
          .connect(signer)
          .userAddressToEnergyCountCycle(participants[i])
      ).toNumber();
    }

    console.log(complianceData);
    // Create leaderboard
    const datapoints = [];
    participants.forEach((userAddr, idx) => {
      datapoints.push({
        name: userAddr,
        value: complianceData[idx],
      });
    });
    datapoints.sort((a, b) => b.value - a.value);
    setData(datapoints);
    setLoading(false);
  };

  useEffect(() => {
    if (address === null || provider === null || signer === null) {
      return;
    }
    console.log("address");
    console.log(address);
    const contractAddress = ethers.utils.getAddress(address);
    const newPact = new Contract(contractAddress, abis.Pact.abi, provider);
    setPact(newPact);
  }, [address, provider, signer]);

  useEffect(() => {
    if (pact === null || signer === null) {
      return;
    }

    getLeaderboard();
  }, [pact, signer]);

  return (
    <Grommet>
      {!loading && signer != null && (
        <DataTable
          columns={[
            {
              property: "name",
              header: <Text>Wallet</Text>,
              primary: true,
            },
            {
              property: "value",
              header: "Reward Savings (LINK)",
              /*
              render: (datum) => (
                <Box pad={{ vertical: "xsmall" }}>
                  <Meter
                    values={[{ value: datum.value }]}
                    thickness="small"
                    size="small"
                  />
                </Box>
              ),*/
            },
          ]}
          data={data}
          pad="small"
          gap="small"
          margin="small"
          size="large"
        />
      )}
      {loading && (
        <Box fill pad="large" align="center" justify="center" gap="medium">
          <Spinner size="large" />
        </Box>
      )}
      {signer == null && (
        <Box fill pad="large" align="center" justify="center" gap="medium">
          <Heading margin="none" level="3">
            Please connect your wallet to use EnergyLink.
          </Heading>
        </Box>
      )}
    </Grommet>
  );
};

export default Leaderboard;
