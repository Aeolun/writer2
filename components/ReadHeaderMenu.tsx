import { Box, Button, Flex, useColorModeValue } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import type { WriterSession } from "../pages/api/auth/[...nextauth]";

export const ReadHeaderMenu = () => {
  const { data } = useSession<WriterSession>();
  const router = useRouter();
  const color = useColorModeValue("blue.300", "gray.700");

  return (
    <Flex bg={color} justifyContent={"space-between"}>
      <Flex px={2} py={1} gap={1}></Flex>
      <Flex px={2} gap={1} py={1} justifyContent={"flex-end"}>
        <Box p={2}>Hello {data?.user?.name}</Box>
        <Button onClick={() => router.push("/write")}>Write</Button>
        {data ? <Button onClick={() => signOut()}>Sign out</Button> : null}
      </Flex>
    </Flex>
  );
};
