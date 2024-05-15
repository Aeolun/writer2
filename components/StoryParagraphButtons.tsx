import {
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import {
  Check,
  Crop,
  Crown,
  MagicWand,
  Menu as MenuIcon,
  Pacman,
  RefreshDouble,
} from "iconoir-react";
import type React from "react";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { aiHelp } from "../lib/actions/aiHelp";
import type { HelpKind } from "../lib/ai-instructions";
import type { Scene } from "../lib/persistence";
import { storyActions } from "../lib/slices/story";
import { AudioButton } from "./AudioButton";

export const StoryParagraphButtons = (props: {
  scene: Scene;
  paragraphId: string;
}) => {
  const scene = props.scene;
  const dispatch = useDispatch();

  const currentParagraph = scene?.paragraphs.find(
    (p) => p.id === scene.selectedParagraph,
  );

  const help = useCallback(
    (helpKind: HelpKind, extra = false, addInstructions = true) => {
      if (!scene) return;
      if (!currentParagraph) {
        return;
      }
      return aiHelp(helpKind, `${currentParagraph.text}`, addInstructions).then(
        (res) => {
          if (extra) {
            dispatch(
              storyActions.updateSceneParagraph({
                sceneId: scene.id,
                paragraphId: currentParagraph?.id,
                extra: res.data.text,
              }),
            );
          } else {
            dispatch(
              storyActions.updateSceneParagraph({
                sceneId: scene.id,
                paragraphId: currentParagraph?.id,
                extra: res.data.text,
              }),
            );
          }
        },
      );
    },
    [scene, dispatch],
  );

  return (
    <HStack
      spacing={2}
      justifyContent={"flex-end"}
      flexWrap={"wrap"}
      w={"100%"}
    >
      <IconButton
        aria-label={"rewrite"}
        icon={<MagicWand />}
        size={"sm"}
        onClick={() => {
          dispatch(
            storyActions.updateSceneParagraph({
              sceneId: props.scene.id,
              paragraphId: props.paragraphId,
              extraLoading: true,
            }),
          );
          help("rewrite")?.then(() => {
            dispatch(
              storyActions.updateSceneParagraph({
                sceneId: props.scene.id,
                paragraphId: props.paragraphId,
                extraLoading: false,
              }),
            );
          });
        }}
      >
        Rewrite
      </IconButton>
      <AudioButton
        size={"sm"}
        text={currentParagraph?.text}
        aria-label={"read paragraph out loud"}
      />
      <IconButton
        aria-label={"rewrite"}
        icon={<RefreshDouble />}
        size={"sm"}
        onClick={() => {
          dispatch(
            storyActions.updateSceneParagraph({
              sceneId: props.scene.id,
              paragraphId: props.paragraphId,
              extraLoading: true,
            }),
          );
          help("rewrite_similar", true, false)?.then(() => {
            dispatch(
              storyActions.updateSceneParagraph({
                sceneId: props.scene.id,
                paragraphId: props.paragraphId,
                extraLoading: false,
              }),
            );
          });
        }}
      >
        Rewrite Similar
      </IconButton>
      <Menu>
        <MenuButton
          as={IconButton}
          size={"sm"}
          aria-label="Options"
          icon={<MenuIcon />}
        />
        <MenuList>
          <MenuItem
            icon={<Crown />}
            onClick={() => {
              dispatch(
                storyActions.splitSceneFromParagraph({
                  sceneId: props.scene.id,
                  paragraphId: props.paragraphId,
                }),
              );
            }}
            command="⌘T"
          >
            Split into new scene from here
          </MenuItem>
          <MenuItem
            icon={<Crown />}
            onClick={() => {
              dispatch(
                storyActions.updateSceneParagraph({
                  sceneId: props.scene.id,
                  paragraphId: props.paragraphId,
                  state: "draft",
                }),
              );
            }}
            command="⌘T"
          >
            Draft
          </MenuItem>
          <MenuItem
            icon={<Crop />}
            onClick={() => {
              dispatch(
                storyActions.updateSceneParagraph({
                  sceneId: props.scene.id,
                  paragraphId: props.paragraphId,
                  state: "revise",
                }),
              );
            }}
            command="⌘N"
          >
            Revise
          </MenuItem>
          <MenuItem
            icon={<Pacman />}
            onClick={() => {
              dispatch(
                storyActions.updateSceneParagraph({
                  sceneId: props.scene.id,
                  paragraphId: props.paragraphId,
                  state: "ai",
                }),
              );
            }}
            command="⌘⇧N"
          >
            AI
          </MenuItem>
          <MenuItem
            icon={<Check />}
            onClick={() => {
              dispatch(
                storyActions.updateSceneParagraph({
                  sceneId: props.scene.id,
                  paragraphId: props.paragraphId,
                  state: "final",
                }),
              );
            }}
            command="⌘⇧N"
          >
            Finalized
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
};
