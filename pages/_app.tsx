import wdyr from "@welldone-software/why-did-you-render";
import React from "react";
if (process.env.NODE_ENV === "development") {
  wdyr(React, {
    trackAllPureComponents: true,
  });
}

import "../styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "../lib/store";
import { Provider } from "react-redux";
import "../lib/App.css";
import {ChakraProvider, extendTheme} from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const theme = extendTheme({
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  }
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
