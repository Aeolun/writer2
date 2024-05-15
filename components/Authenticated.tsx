import { Button, Flex } from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import React, { type ReactElement } from "react";
import type { WriterSession } from "../pages/api/auth/[...nextauth]";

export const Authenticated = (props: {
  children: ReactElement;
}): ReactElement | null => {
  const { data: session, status } = useSession();
  const writerSession = session as WriterSession;
  console.log(writerSession);
  if (writerSession) {
    const expireDate = new Date(writerSession.expires);
    if (session && expireDate.getTime() > Date.now()) {
      return props.children ? props.children : null;
    }
  }
  return (
    <Flex flexDirection={"column"} height={"100%"}>
      <Flex width={"80"} direction={"column"} margin={"4em auto"}>
        <Head>
          <title>Writer</title>
        </Head>

        <p>Not signed in</p>
        <Button onClick={() => signIn()}>Sign in</Button>
      </Flex>
    </Flex>
  );
};
