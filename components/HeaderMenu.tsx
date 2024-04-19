import {
  Button,
  CircularProgress,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { save } from "../lib/actions/save";
import { sync } from "../lib/actions/sync";
import { globalActions } from "../lib/slices/global";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";

export const HeaderMenu = () => {
  const saving = useSelector((store: RootState) => store.base.saving);
  const isDirty = useSelector((store: RootState) => store.base.isDirty);
  const syncing = useSelector((store: RootState) => store.base.syncing);
  const aiBackend = useSelector((store: RootState) => store.base.aiBackend);
  const dispatch = useDispatch();
  const color = useColorModeValue("blue.300", "gray.700");

  return (
    <Flex bg={color} justifyContent={"space-between"}>
      <Flex px={2} py={1} gap={1}>
        <Link href={"/"}>
          <Button>Story</Button>
        </Link>
        <Link href={"/characters"}>
          <Button>Characters</Button>
        </Link>
        <Link href={"/locations"}>
          <Button>Locations</Button>
        </Link>
        <Link href={"/plot-points"}>
          <Button>Plot Points</Button>
        </Link>
        <Link href={"/settings"}>
          <Button>Settings</Button>
        </Link>
        <Link href={"/language"}>
          <Button>Language</Button>
        </Link>
        <Link href={"/preview"}>
          <Button>Preview</Button>
        </Link>
      </Flex>
      <Flex px={2} gap={1} py={1} justifyContent={"flex-end"}>
        <Button
          onClick={() => {
            dispatch(
              globalActions.setAiBackend(
                aiBackend === "google"
                  ? "openai"
                  : aiBackend === "claude"
                    ? "google"
                    : "claude",
              ),
            );
          }}
        >
          AI {aiBackend}
        </Button>
        <Button
          onClick={() => {
            dispatch(storyActions.unload());
            axios.get("/api/list").then((res) => {
              dispatch(globalActions.setStories(res.data));
            });
          }}
        >
          Switch
        </Button>

        <Button
          rightIcon={
            saving ? (
              <CircularProgress isIndeterminate color="green.300" />
            ) : undefined
          }
          onClick={() => {
            save().catch((e) => {
              console.error(e);
            });
          }}
        >
          Save
        </Button>
        <Button
          rightIcon={
            syncing ? (
              <CircularProgress isIndeterminate color="green.300" />
            ) : undefined
          }
          colorScheme={"yellow"}
          onClick={() => {
            sync()
              .catch((e) => {
                console.error(e);
              })
              .then(() => {
                dispatch(globalActions.setDirty(false));
              });
          }}
          isDisabled={!isDirty}
        >
          Git push
        </Button>
        <Button onClick={() => signOut()}>Sign out</Button>
      </Flex>
    </Flex>
  );
};
