import "../styles/globals.css";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Grommet,
  grommet,
  Layer,
  Text,
  Heading,
} from "grommet";
import { Add, FormClose, StatusGood } from "grommet-icons";
import { Contract } from "@ethersproject/contracts";
import AppBar from "../modules/navigation/appBar";
import WalletButton from "../modules/navigation/walletButton";
import LogoHeader from "../modules/navigation/logoHeader";
import { ProviderContext } from "../modules/hooks";
import ToastContext from "../modules/hooks/useToast";
import { abis } from "../modules/contracts";
import SignerContext from "../modules/hooks/useSigner";
import GatewayContext from "../modules/hooks/useGateway";
import PactContext from "../modules/hooks/usePact";
import SidebarNav from "../modules/navigation/sideBar";

const getDefaultPageLayout = (page) => page;

function MyApp({ Component, pageProps }) {
  // Allow us to render children pages
  const getPageLayout = Component.getLayout || getDefaultPageLayout;

  // Context
  const [provider, setProvider] = useState(null);
  const [gateway, setGateway] = useState(null);
  const [pact, setPact] = useState(null);
  const [toast, setToast] = useState(null);
  const [signer, setSigner] = useState(null);

  // UI
  const [sidebar, setSidebar] = useState(true);

  // Values for Providers
  const providerValue = { provider, setProvider };
  const gatewayValue = { gateway, setGateway };
  const pactValue = { pact, setPact };
  const signerValue = { signer, setSigner };
  const toastValue = { toast, setToast };

  const [open, setOpen] = useState(false);
  const [toastTimeout, setToastTimeout] = useState();

  // Set the gateway when we load app
  useEffect(() => {
    if (provider === null) {
      return;
    }
    setGateway(
      new Contract(
        "0x9488548bA591Eabe11b94C2788CD9a144f68e127", // Kovan
        abis.Gateway.abi,
        provider
      )
    );
    setSigner(provider.getSigner());
  }, [provider]);

  useEffect(() => {
    if (toast === null) {
      return;
    }
    setOpen(true);
    setToastTimeout(
      setTimeout(() => {
        setOpen(false);
        setToast(null);
      }, 3000)
    );
  }, [toast]);

  const onClose = () => {
    setOpen(false);
    clearTimeout(toastTimeout);
  };
  /*
  const styles={
    position:'fixed'
  };
*/
  return (
    <Grommet theme={grommet} full>
      <Box fill>
        <ProviderContext.Provider value={providerValue}>
          <SignerContext.Provider value={signerValue}>
            <GatewayContext.Provider value={gatewayValue}>
              <PactContext.Provider value={pactValue}>
                <ToastContext.Provider value={toastValue}>
                  <Grid
                    fill
                    rows={["auto", "flex"]}
                    columns={["auto", "flex"]}
                    areas={[
                      { name: "header", start: [0, 0], end: [1, 0] },
                      { name: "sidebar", start: [0, 1], end: [0, 1] },
                      { name: "main", start: [1, 1], end: [1, 1] },
                    ]}
                  >
                    <Box
                      gridArea="header"
                      direction="row"
                      align="center"
                      justify="between"
                    >
                      <AppBar>
                        <LogoHeader />
                        <WalletButton />
                      </AppBar>
                    </Box>
                    {sidebar && (
                      <Box
                        gridArea="sidebar"
                        background="neutral-2"
                        width="small"
                        animation={[
                          { type: "fadeIn", duration: 300 },
                          { type: "slideRight", size: "xlarge", duration: 150 },
                        ]}
                      >
                        <SidebarNav />
                      </Box>
                    )}
                    <Box gridArea="main" justify="center" align="center" fill>
                      {getPageLayout(<Component {...pageProps} />)}
                    </Box>
                  </Grid>
                  {open && (
                    <Layer
                      position="bottom"
                      modal={false}
                      margin={{ vertical: "medium", horizontal: "small" }}
                      onEsc={onClose}
                      responsive={false}
                      plain
                    >
                      <Box
                        align="center"
                        direction="row"
                        gap="small"
                        justify="between"
                        round="medium"
                        elevation="medium"
                        pad={{ vertical: "xsmall", horizontal: "small" }}
                        background={`status-${toast.status}`}
                      >
                        <Box align="center" direction="row" gap="xsmall">
                          <StatusGood />
                          <Text>{toast.message}</Text>
                        </Box>
                        <Button icon={<FormClose />} onClick={onClose} plain />
                      </Box>
                    </Layer>
                  )}
                </ToastContext.Provider>
              </PactContext.Provider>
            </GatewayContext.Provider>
          </SignerContext.Provider>
        </ProviderContext.Provider>
      </Box>
    </Grommet>
  );
}

export default MyApp;
