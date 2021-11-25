import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Grid,
  grommet,
  Grommet,
  ResponsiveContext,
  Heading, DataChart, Text, Spinner,
} from "grommet";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { ProviderContext } from "../hooks";
import SignerContext from "../hooks/useSigner";
import { abis } from "../contracts";
import PactContext from "../hooks/usePact";
import moment from 'moment';


const data = [];
for (let i = 0; i < 13; i += 1) {
  const v = -Math.sin(i / 2.0);
  data.push({
    date: `2020-07-${((i % 30) + 1).toString().padStart(2, 0)}`,
    amount: Math.floor(v * 100),
  });
}

const formatData = (datapoints) => {
  return datapoints.map( point => {
    return {
      date: moment.format(),
      amount: point
    }
  })
}


export const PACT_STATES = {
  0: "Disabled",
  1: "Idle",
  2: "Running",
  3: "Complete"
};

const Pact = ({ address }) => {

  address = "whatever test for now";

  // Web3
  const { provider } = useContext(ProviderContext);
  const { signer } = useContext(SignerContext);
  const { pact, setPact } = useContext(PactContext);

  // Helpers for UX/UI
  const [loading, setLoading] = useState(true);

  // Contract Information
  const [eiaRegion, setEiaRegion] = useState();
  const [listingState, setListingState] = useState(null);
  const [nestData, setNestData] = useState([]);
  const [complianceData, setComplianceData] = useState([]);

  useEffect(() => {
    if (address === null || provider === null || signer === null) {
      return;
    }
    const contractAddress = ethers.utils.getAddress(address);
    const newPact = new Contract(
      contractAddress,
      abis.Pact.abi,
      provider
    );
    setPact(newPact);
  }, [address, provider, signer]);

  useEffect(() => {
    if (pact === null || signer === null) {
      return;
    }

    async function setData() {
      setLoading(true);
      const [
        _eiaRegion,
        _signerAddress,
        _pactState
      ] = await Promise.all([
        await pact.connect(signer).EIARegion(),
        await signer.getAddress(),
        await pact.connect(signer).PactState()
      ]);
      setLoading(false);
      const _nestData = await pact.connect(signer).userAddressToNestData(_signerAddress);
      const _complianceData = await pact.connect(signer).userAddressToComplianceData(_signerAddress);

      setEiaRegion(_eiaRegion);
      // TODO parse out the nest data
      // struct NestData {
      //   uint mode;
      //   uint temperature;
      //   uint heatSetpoint;
      //   uint coolSetpoint;
      // }
      setNestData(_nestData);
      setComplianceData(_complianceData);
      // eslint-disable-next-line no-prototype-builtins
      if (PACT_STATES.hasOwnProperty(_pactState)) {
        // eslint-disable-next-line no-underscore-dangle
        setListingState(PACT_STATES[_pactState]);
      }
    }
    setData();
  }, [pact, signer])

  // TODO show the compliance on hover
  return (
    <Grommet>
      {!loading && (
        <Box align="center" justify="start" pad="medium">
          <DataChart
            data={data}
            series={[
              {
                property: 'date',
                render: (date) => (
                  <Box pad="xsmall" align="start">
                    <Text>
                      {new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </Box>
                ),
              },
              'amount',
            ]}
            chart={[
              {
                property: 'amount',
                type: 'area',
                thickness: 'xsmall',
                color: 'graph-0',
                opacity: 'medium',
              },
              {
                property: 'amount',
                type: 'line',
                thickness: 'xsmall',
                round: true,
              },
              { property: 'amount', type: 'bar', thickness: 'hair' },
              {
                property: 'amount',
                type: 'point',
                round: true,
                thickness: 'medium',
              },
            ]}
            axis={{ x: 'date', y: { property: 'amount', granularity: 'medium' } }}
            guide={{ y: true }}
            gap="medium"
            pad="small"
          />
        </Box>
      )}
      {loading && (
        <Box fill pad="large" align="center" justify="center" gap="medium">
          <Spinner size="large" />
        </Box>
      )}
    </Grommet>
  )
}

export default Pact;
