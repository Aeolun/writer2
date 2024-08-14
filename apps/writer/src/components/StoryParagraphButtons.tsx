import {
    Button,
    HStack,
    IconButton,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react";
import {Check, Crop, Crown, MagicWand, Menu as MenuIcon, Pacman, RefreshDouble, Translate,} from "iconoir-react";
import React, {useCallback, useState} from "react";
import {useDispatch} from "react-redux";
import type {HelpKind} from "../lib/ai-instructions";
import type {Scene} from "../../../shared/src/schema.ts";
import {storyActions} from "../lib/slices/story";
import {useAi} from "../lib/use-ai.ts";
import {AudioButton} from "./AudioButton";

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
      return useAi(helpKind, `${currentParagraph.text}`, addInstructions).then(
        (res) => {
          if (extra) {
            dispatch(
              storyActions.updateSceneParagraph({
                sceneId: scene.id,
                paragraphId: currentParagraph?.id,
                extra: res ?? undefined,
              }),
            );
          } else {
            dispatch(
              storyActions.updateSceneParagraph({
                sceneId: scene.id,
                paragraphId: currentParagraph?.id,
                extra: res ?? undefined,
              }),
            );
          }
        },
      );
    },
    [scene, dispatch],
  );
  const [translationModalOpen, setTranslationModalOpen] = useState(false);
  const [translationText, setTranslationText] = useState(
    currentParagraph?.translation ?? "",
  );

  return (
    <HStack
      spacing={1}
      justifyContent={"flex-end"}
      flexWrap={"wrap"}
      w={"100%"}
    >
      <IconButton
        aria-label={"rewrite"}
        icon={<MagicWand />}
        title="Rewrite the paragraph with AI. This will show the suggestion next to the existing paragraph."
        size={"xs"}
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
        size={"xs"}
        text={currentParagraph?.text ?? ""}
        isDisabled={!currentParagraph?.text}
        aria-label={"read paragraph out loud"}
        title="Read paragraph out loud"
      />
      <IconButton
        aria-label={"rewrite"}
        icon={<RefreshDouble />}
        size={"xs"}
        title="Rewrite the paragraph with AI, but keep as close to the original as possible. This will show the suggestion next to the existing paragraph."
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
          size={"xs"}
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
          <Modal
            isOpen={translationModalOpen}
            onClose={() => setTranslationModalOpen(false)}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Translation</ModalHeader>
              <ModalBody>
                <Input
                  type={"text"}
                  value={translationText}
                  onChange={(e) => setTranslationText(e.currentTarget.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  colorScheme={"green"}
                  onClick={() => {
                    dispatch(
                      storyActions.updateSceneParagraph({
                        sceneId: props.scene.id,
                        paragraphId: props.paragraphId,
                        translation: translationText,
                      }),
                    );
                    setTranslationModalOpen(false);
                  }}
                >
                  Save
                </Button>
                <Button onClick={() => setTranslationModalOpen(false)}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <MenuItem
            icon={<Translate />}
            title="If this paragraph contains a foreign language, you can provide a translation here. This will be shown underneath the paragraph."
            onClick={() => {
              setTranslationModalOpen(true);
            }}
            command="⌘⇧N"
          >
            Translation
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
};
