import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import wdyr from "@welldone-software/why-did-you-render";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import Authenticated from "../components/Authenticated";
import "../lib/App.css";
import { store } from "../lib/store";
import "../styles/globals.css";

if (process.env.NODE_ENV === "development") {
  wdyr(React, {
    trackAllPureComponents: true,
  });
}

const queryClient = new QueryClient();

const theme = extendTheme({
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <Provider store={store}>
            <Authenticated>
              <Component {...pageProps} />
            </Authenticated>
          </Provider>
        </ChakraProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
