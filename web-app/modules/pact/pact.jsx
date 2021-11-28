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
} from "grommet";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { ProviderContext } from "../hooks";
import SignerContext from "../hooks/useSigner";
import { abis } from "../contracts";
import PactContext from "../hooks/usePact";
import moment from "moment";

const data = [];
for (let i = 0; i < 13; i += 1) {
  const v = -Math.sin(i / 2.0);
  data.push({
    date: `2020-07-${((i % 30) + 1).toString().padStart(2, 0)}`,
    amount: Math.floor(v * 100),
  });
}

const formatData = (datapoints) => {
  return datapoints.map((point) => {
    return {
      date: moment.format(),
      amount: point,
    };
  });
};

export const PACT_STATES = {
  0: "Disabled",
  1: "Idle",
  2: "Running",
  3: "Complete",
};

const Pact = ({ address }) => {
  address = "whatever test for now";

  // Web3
  const { provider } = useContext(ProviderContext);
  const { signer } = useContext(SignerContext);
  const { pact, setPact } = useContext(PactContext);

  // Helpers for UX/UI
  const [loading, setLoading] = useState(false);
  const [joinedPact, setJoinedPact] = useState(false);

  // Contract Information
  const [eiaRegion, setEiaRegion] = useState();
  const [pactState, setPactState] = useState(null);
  const [nestData, setNestData] = useState([]);
  const [complianceData, setComplianceData] = useState([]);
  const [gridLoad, setGridLoad] = useState([]);

  const getEIAData = async (startDate = "11192021 08:00") => {
    // const start = moment().utc().add(-7, "days").format("MMDDYYYY HH:00:00");
    const end = moment().utc().format("MMDDYYYY HH:00:00");
    console.log(end);
    const response = await fetch(
      `https://www.eia.gov/electricity/930-api/region_data/series_data?type[0]=TI&respondent[0]=LDWP&start=${startDate}&end=${end}&frequency=hourly&timezone=Pacific&limit=10000&offset=0`
    );
    const jsonData = await response.json();
    const data = jsonData[0];
    console.log(data.data);
    const values = data.data[0]["VALUES"];
    console.log(values);
    const data_values = values["DATA"];
    const date_values = values["DATES"];
    let data_points;
    if (data_values.length !== date_values.length) {
      console.log(`Reported data and dates doesn't match in length`);
      return;
    }
    data_points = data_values.map((data_point, idx) => {
      return {
        amount: -data_point,
        date: date_values[idx],
      };
    });
    // TODO remove; debug for now;
    console.log(data_points);
    setGridLoad(data_points);
    return data_points;
  };

  const setData = async () => {
    setLoading(true);
    const [_eiaRegion, _signerAddress, _pactState] = await Promise.all([
      await pact.connect(signer).EIARegion(),
      await signer.getAddress(),
      await pact.connect(signer).PactState(),
    ]);
    setLoading(false);
    const _nestData = await pact
      .connect(signer)
      .userAddressToNestData(_signerAddress);
    const _complianceData = await pact
      .connect(signer)
      .userAddressToComplianceData(_signerAddress);
    const _participants = await pact.connect(signer).participants();

    setEiaRegion(_eiaRegion);
    // TODO parse out the nest data
    // struct NestData {
    //   uint mode;
    //   uint temperature;
    //   uint heatSetpoint;
    //   uint coolSetpoint;
    // }
    // Dates + Total Interchange(TI)
    const eiaData = await getEIAData();
    setNestData(_nestData);
    setComplianceData(_complianceData);
    // eslint-disable-next-line no-prototype-builtins
    if (PACT_STATES.hasOwnProperty(_pactState)) {
      // eslint-disable-next-line no-underscore-dangle
      setPactState(PACT_STATES[_pactState]);
    }
    setJoinedPact(_participants.indexOf(_signerAddress) !== -1);
  };

  const joinPact = async () => {
    if (pact === null || signer === null) {
      return;
    }

    pact.removeAllListeners("PactJoined");
    pact.on("PactJoined", async (joinedAddress) => {
      setData();
    });

    await pact.connect(signer).joinPact(0);
    setLoading(true);
  };

  // TODO remove; debug for now;
  useEffect(() => {
    getEIAData();
  }, []);

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

    setData();
  }, [pact, signer]);

  // TODO show the compliance on hover
  return (
    <Grommet>
      {!loading && !joinedPact && (
        <Box
          direction="row-responsive"
          justify="center"
          align="center"
          pad="medium"
        >
          <DataChart
            data={gridLoad}
            series={[
              {
                property: "date",
                render: (date) => (
                  <Box pad="xsmall" align="start">
                    <Text>
                      {new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </Box>
                ),
              },
              {
                property: "amount",
                render: (amount) => (
                  <Box pad="xsmall" align="start">
                    <Text>{amount}</Text>
                  </Box>
                ),
              },
            ]}
            chart={[
              {
                property: "amount",
                type: "area",
                thickness: "xsmall",
                color: "graph-0",
                opacity: "medium",
              },
              {
                property: "amount",
                type: "line",
                thickness: "xsmall",
                round: true,
              },
              { property: "amount", type: "bar", thickness: "hair" },
              {
                property: "amount",
                type: "point",
                round: true,
                thickness: "medium",
              },
            ]}
            guide={{
              y: { granularity: "medium" },
              x: { granularity: "medium" },
            }}
            alignSelf="center"
            bounds="align"
            gap="xsmall"
            pad="small"
            size={{ width: "large", height: "large" }}
            margin="small"
            detail
          />
        </Box>
      )}
      {!loading && joinedPact && (
        <Box fill pad="large" align="center" justify="center" gap="medium">
          <Button primary label="Join Campaign" onClick={joinPact} />
        </Box>
      )}
      {loading && (
        <Box fill pad="large" align="center" justify="center" gap="medium">
          <Spinner size="large" />
        </Box>
      )}
    </Grommet>
  );
};

export default Pact;
