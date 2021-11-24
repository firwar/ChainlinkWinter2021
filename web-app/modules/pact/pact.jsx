import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Grid,
  grommet,
  Grommet,
  ResponsiveContext,
  Heading, DataChart, Text,
} from "grommet";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { ProviderContext } from "../hooks";
import SignerContext from "../hooks/useSigner";
import { abis } from "../contracts";
import PactContext from "../hooks/usePact";

const data = [];
for (let i = 0; i < 13; i += 1) {
  const v = -Math.sin(i / 2.0);
  data.push({
    date: `2020-07-${((i % 30) + 1).toString().padStart(2, 0)}`,
    amount: Math.floor(v * 100),
  });
}

const Pact = ({ address }) => {

  const { provider } = useContext(ProviderContext);
  const { signer } = useContext(SignerContext);
  const { usePact } = useContext(PactContext);

  return (
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
  )
}

export default Pact;
