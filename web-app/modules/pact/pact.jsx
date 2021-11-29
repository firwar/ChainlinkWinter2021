import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  grommet,
  Grommet,
  ResponsiveContext,
  Heading,
  DataChart,
  Text,
  Spinner,
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
    temp: Math.floor(v * 100),
  });
}

const formatData = (datapoints) => {
  return datapoints.map((point) => {
    return {
      date: moment.format(),
      temp: point,
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
  address = "0x757341e5FD0E5604bF183b5CaA2d8144059c727b";

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

  const getEIAData = async (startDate = "11262021 08:00") => {
    // const start = moment().utc().add(-7, "days").format("MMDDYYYY HH:00:00");
    const end = moment().utc().format("MMDDYYYY HH:00:00");
    console.log(end);
    const response = await fetch(
      `https://www.eia.gov/electricity/930-api/region_data/series_data?type[0]=D&respondent[0]=LDWP&start=${startDate}&end=${end}&frequency=hourly&timezone=Pacific&limit=10000&offset=0`
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
        demand: data_point / 100,
        temp: Math.floor(75 + data_point / 1000) - 2,
        compliance: 1,
        date: date_values[idx],
      };
    });
    // TODO remove; debug for now;
    console.log("data points");
    console.log(data_points);
    let bad_compliance = [];
    // let bad_data = data_points.splice(5, 5);
    // console.log(bad_data);
    // bad_data = bad_data.concat(data_points.splice(10, 5));
    // console.log(bad_data)
    // const bad_compliance = bad_data.map((dp) => {
    //   return {
    //     bad_demand: dp.demand,
    //     bad_temp: dp.temp,
    //     compliance: 0,
    //     date: dp.date,
    //   };
    // });
    // data_points = data_points.concat(bad_compliance);
    return { bad_compliance, data_points };
  };

  // const buildData = async () => {
  //   setLoading(true);
  //   const [_eiaRegion, _signerAddress, _pactState] = await Promise.all([
  //     await pact.connect(signer).EIARegion(),
  //     await signer.getAddress(),
  //     await pact.connect(signer).PactState(),
  //   ]);
  //   setLoading(false);
  //   const _nestData = await pact
  //     .connect(signer)
  //     .userAddressToNestData(_signerAddress);
  //   const _complianceData = await pact
  //     .connect(signer)
  //     .userAddressToComplianceData(_signerAddress);
  //   const _participants = await pact.connect(signer).getParticipants();
  //
  //   setEiaRegion(_eiaRegion);
  //   // TODO parse out the nest data
  //   // struct NestData {
  //   //   uint mode;
  //   //   uint temperature;
  //   //   uint heatSetpoint;
  //   //   uint coolSetpoint;
  //   // }
  //   // Dates + Total Interchange(TI)
  //   console.log(_nestData);
  //   console.log(_complianceData);
  //   const eiaData = await getEIAData();
  //   setNestData(_nestData);
  //   setComplianceData(_complianceData);
  //   // eslint-disable-next-line no-prototype-builtins
  //   if (PACT_STATES.hasOwnProperty(_pactState)) {
  //     // eslint-disable-next-line no-underscore-dangle
  //     setPactState(PACT_STATES[_pactState]);
  //   }
  //   setJoinedPact(_participants.indexOf(_signerAddress) !== -1);
  // };

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
    //getGraphEIAData();
  }, []);

  useEffect(() => {
    if (address === null || provider === null || signer === null) {
      console.log(address);
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

    async function setData() {
      const _signerAddress = await signer.getAddress();
      const _participants = await pact.connect(signer).getParticipants();
      setJoinedPact(_participants.indexOf(_signerAddress) !== -1);
      setLoading(true);
      const temp_data_bn = await pact
        .connect(signer)
        .getTempDataArray(_signerAddress);
      const comp_data_bn = await pact
        .connect(signer)
        .getComplianceDataArray(_signerAddress);
      setLoading(false);

      console.log(temp_data_bn.length);

      const eiaData = await getEIAData();
      console.log(eiaData);

      // let temp_data_num = [];
      // let temp_data_cnt = [];
      // let comp_data_num = [];
      // for (let i = 0; i < temp_data_bn.length; i++) {
      //   temp_data_num[i] = temp_data_bn[i].toNumber();
      //   comp_data_num[i] = comp_data_bn[i].toNumber();
      //   temp_data_cnt[i] = i;
      // }
      // console.log(temp_data_num);
      // let data_points = temp_data_num.map((data_point, idx) => {
      //   return {
      //     temp: data_point,
      //     compliance: comp_data_num[idx],
      //     date: temp_data_cnt[idx],
      //   };
      // });
      // console.log(data_points);
      setGridLoad(eiaData.data_points);

      /*
      const [_eiaRegion, _signerAddress, _pactState] = await Promise.all([
        await pact.connect(signer).EIARegion(),
        await signer.getAddress(),
        await pact.connect(signer).PactState(),
      ]);

      const _nestData = await pact
        .connect(signer)
        .userAddressToNestData(_signerAddress);
      const _complianceData = await pact
        .connect(signer)
        .userAddressToComplianceData(_signerAddress);

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
      */
    }
    setData();
  }, [pact, signer]);

  // TODO show the compliance on hover
  return (
    <Grommet>
      {!loading && joinedPact && signer != null && (
        <Box direction="column" pad="medium">
          <Box
            direction="row-responsive"
            pad="medium"
            gap="large"
            justifyContent="space-between"
          >
            <Box
              direction="row-responsive"
              align="left"
              alignSelf="start"
              pad="medium"
            >
              <Button
                primary
                label="Current Rewards: 1 LINK"
                alignSelf="start"
              />
            </Box>
            <Box
              direction="row-responsive"
              align="right"
              alignSelf="end"
              pad="medium"
            >
              <Button primary label="Disable Pact" alignSelf="start" />
            </Box>
          </Box>
          <DataChart
            data={gridLoad}
            legend={true}
            series={[
              {
                property: "date",
                render: (date) => (
                  <Box pad="xsmall" align="start">
                    <Text>
                      {new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                      })}
                    </Text>
                  </Box>
                ),
              },
              {
                property: "temp",
                render: (temp) => (
                  <Box pad="xsmall" align="start">
                    <Text>{temp}</Text>
                  </Box>
                ),
              },
              {
                property: "demand",
                render: (demand) => (
                  <Box pad="xsmall" align="start">
                    <Text>{demand * 100}</Text>
                  </Box>
                ),
              },
            ]}
            chart={[
              {
                property: "temp",
                type: "area",
                thickness: "xsmall",
                color: "graph-0",
                opacity: "medium",
              },
              {
                property: "temp",
                type: "line",
                thickness: "xsmall",
                round: true,
              },
              { property: "temp", type: "bar", thickness: "hair" },
              {
                property: "temp",
                type: "point",
                round: true,
                thickness: "small",
              },
              {
                property: "demand",
                type: "line",
                color: "red",
                thickness: "xsmall",
                round: true,
              },
              {
                property: "demand",
                type: "point",
                color: "red",
                round: true,
                thickness: "small",
              },
            ]}
            guide={{
              y: { granularity: "fine" },
              x: { granularity: "medium" },
            }}
            alignSelf="center"
            bounds="align"
            gap="xsmall"
            pad="small"
            size={{ width: "xlarge", height: "large" }}
            axis={{ x: "date", y: { property: "temp", granularity: "fine" } }}
            margin="small"
            detail
          />
        </Box>
      )}
      {!loading && !joinedPact && signer != null && (
        <Box fill pad="large" align="center" justify="center" gap="medium">
          <Button primary label="Join Campaign" onClick={joinPact} />
        </Box>
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

export default Pact;
