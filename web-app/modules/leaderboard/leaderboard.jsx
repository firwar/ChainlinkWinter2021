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
  // Web3
  const { provider } = useContext(ProviderContext);
  const { signer } = useContext(SignerContext);
  const { pact, setPact } = useContext(PactContext);

  // Helpers for UX/UI
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([
    { name: "Alan", value: 20 },
    { name: "Bryan", value: 30 },
    { name: "Chris", value: 40 },
    { name: "Eric", value: 80 },
  ]);

  const getLeaderboard = async () => {
    setLoading(true);

    const _allComplianceData = await pact
      .connect(signer)
      .userAddressToComplianceData();

    console.log(_allComplianceData);

    // Create leaderboard
    const datapoints = [];
    Object.keys(_allComplianceData).forEach((userAddr) => {
      datapoints.push({
        name: userAddr,
        value: _allComplianceData[userAddr].reduce(reducer),
      });
    });
    setData(datapoints);
    setLoading(false);
  };

  useEffect(() => {
    if (address === null || provider === null || signer === null) {
      return;
    }
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
      {!loading && (
        <DataTable
          columns={[
            {
              property: "name",
              header: <Text>Name</Text>,
              primary: true,
            },
            {
              property: "value",
              header: "Compliance",
              render: (datum) => (
                <Box pad={{ vertical: "xsmall" }}>
                  <Meter
                    values={[{ value: datum.value }]}
                    thickness="small"
                    size="small"
                  />
                </Box>
              ),
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
    </Grommet>
  );
};

export default Leaderboard;
