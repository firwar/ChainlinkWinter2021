import { createContext } from 'react';

const GatewayContext = createContext({
  Gateway: null,
  setGateway: () => {},
});

export default GatewayContext;
