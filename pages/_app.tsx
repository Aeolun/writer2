import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import wdyr from "@welldone-software/why-did-you-render";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { AiPopup } from "../components/AiPopup";
import { Authenticated } from "../components/Authenticated";
import "../lib/App.css";
import { store } from "../lib/store";
import "../styles/globals.css";
import { trpc } from "../lib/trpc";

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
          <Authenticated>
            <Provider store={store}>
              <AiPopup />
              <Component {...pageProps} />
            </Provider>
          </Authenticated>
        </ChakraProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default trpc.withTRPC(MyApp);
