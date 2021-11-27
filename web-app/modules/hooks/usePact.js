import { createContext } from 'react';

const PactContext = createContext({
  Pact: null,
  setPact: () => {},
});

export default PactContext;
