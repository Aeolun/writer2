import {
  Avatar,
  Button,
  CircularProgress,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
  Text,
  Box,
} from "@chakra-ui/react";
import { Menu as MenuIcon } from "iconoir-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "wouter";
import { settingsStore } from "../global-settings-store";
import { globalActions } from "../lib/slices/global";
import { storyActions } from "../lib/slices/story";
import { type RootState, store } from "../lib/store";
import { reloadTrpc, trpc } from "../lib/trpc";
import { addNotification } from "../lib/slices/notifications";
import { NotificationManager } from "./NotificationManager";

export const WriteHeaderMenu = () => {
  const saving = useSelector((store: RootState) => store.base.saving);
  const syncing = useSelector((store: RootState) => store.base.syncing);
  const alteredSincePublish = useSelector(
    (store: RootState) =>
      !store.story.lastPublishTime ||
      store.story.modifiedTime > store.story.lastPublishTime,
  );
  const [location, setLocation] = useLocation();
  const aiBackend = useSelector((store: RootState) => store.base.aiBackend);
  const dispatch = useDispatch();
  const color = useColorModeValue("blue.300", "gray.700");
  const isSignedIn = useSelector((store: RootState) => store.base.signedInUser);
  const rrStoryId = useSelector(
    (store: RootState) => store.story.settings?.royalRoadId,
  );

  return (
    <>
      <NotificationManager />
      <Flex
        bg={color}
        justifyContent={"space-between"}
        boxShadow={"0px 0px 4px 4px rgba(0, 0, 0, 0.3)"}
        zIndex={5}
      >
        <Flex px={2} py={1} gap={1}>
          <Menu>
            <MenuButton>
              <IconButton icon={<MenuIcon />} aria-label="menu" />
            </MenuButton>
            <MenuList>
              <Link href="/new-story">
                <MenuItem>New Story</MenuItem>
              </Link>
              <MenuItem
                onClick={() => {
                  dispatch(storyActions.unload());
                  setLocation("/open-story");
                }}
              >
                Open Story
              </MenuItem>
              <MenuItem>Save Story</MenuItem>
            </MenuList>
          </Menu>
          <Link href={"/"}>
            <Button>Story</Button>
          </Link>
          <Link href={"/characters"}>
            <Button>Characters</Button>
          </Link>
          <Link href={"/files"}>
            <Button>Files</Button>
          </Link>
          <Link href={"/search"}>
            <Button>Search</Button>
          </Link>
          <Link href={"/locations"}>
            <Button>Locations</Button>
          </Link>
          <Link href={"/plot-points"}>
            <Button>Plot Points</Button>
          </Link>
          <Link href={"/settings"}>
            <Button>Story Settings</Button>
          </Link>
          <Link href={"/language"}>
            <Button>Language</Button>
          </Link>
          <Link href={"/preview"}>
            <Button>Preview</Button>
          </Link>
        </Flex>
        <Flex
          px={2}
          gap={1}
          py={1}
          justifyContent={"flex-end"}
          alignItems={"center"}
        >
          {saving ? (
            <CircularProgress isIndeterminate color="green.300" size={"40px"} />
          ) : null}
          <Button
            onClick={() => {
              dispatch(globalActions.setAiPopupOpen(true));
            }}
          >
            AI Question
          </Button>

          <Button
            isDisabled={!rrStoryId || !isSignedIn?.name}
            onClick={() => {
              const state = store.getState();
              const numericStoryId = Number(rrStoryId);

              if (Number.isNaN(numericStoryId)) {
                console.error("Invalid Royal Road story ID");
                return;
              }

              trpc.importRoyalroad
                .mutate({
                  storyId: numericStoryId,
                })
                .then((result) => {
                  console.log("imported");
                  if (result?.story) {
                    dispatch(storyActions.setStory(result.story));
                  }
                })
                .catch((error) => {
                  console.error(error);
                });
            }}
          >
            Import
          </Button>
          <Button
            onClick={() => {
              const state = store.getState();
              trpc.uploadStory
                .mutate({
                  story: state.story,
                  language: state.language,
                })
                .then((result) => {
                  console.log("uploaded");
                  dispatch(
                    storyActions.updatePublishTime(new Date(result).getTime()),
                  );
                  dispatch(
                    addNotification({
                      message: "Story uploaded successfully",
                      type: "success",
                    }),
                  );
                })
                .catch((error) => {
                  console.error(error);
                  const errorMessage =
                    error.message || "An unknown error occurred";
                  const errorDetails =
                    error.shape?.data?.zodError?.fieldErrors || {};
                  dispatch(
                    addNotification({
                      message: `Failed to upload story: ${errorMessage}`,
                      type: "error",
                      details: errorDetails,
                    }),
                  );
                });
            }}
            isDisabled={!isSignedIn?.name}
          >
            Upload
          </Button>

          <Menu>
            <MenuButton as={Box} bg="transparent" _hover={{ bg: "blue.400" }}>
              <Flex alignItems="center" h="40px">
                <Avatar
                  size="md"
                  h="40px"
                  w="40px"
                  name={isSignedIn?.name ?? undefined}
                  src=""
                />
              </Flex>
            </MenuButton>
            {isSignedIn ? (
              <MenuList>
                <Link href={"/global-settings"}>
                  <MenuItem>Settings</MenuItem>
                </Link>
                <Link href={"/profile"}>
                  <MenuItem>Profile</MenuItem>
                </Link>
                <MenuItem
                  onClick={() => {
                    trpc.logout.mutate().then(() => {
                      settingsStore.delete("client-token").then(() => {
                        reloadTrpc();
                        dispatch(globalActions.setSignedInUser(undefined));
                        settingsStore.save();
                      });
                    });
                  }}
                >
                  Log out
                </MenuItem>
              </MenuList>
            ) : (
              <MenuList>
                <Link href={"/global-settings"}>
                  <MenuItem>App settings</MenuItem>
                </Link>
                <MenuItem
                  onClick={() => {
                    dispatch(globalActions.setSigninPopupOpen(true));
                  }}
                >
                  Sign in
                </MenuItem>
              </MenuList>
            )}
          </Menu>
        </Flex>
      </Flex>
    </>
  );
};
