import React, {useState, Suspense, useCallback, useRef, useEffect} from "react";
import { Scene, storyActions } from "../lib/slices/story";
import {
  Box,
  Button,
  Flex,
  Textarea,
  Select,
  Input,
  Heading,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { plotpointSelector } from "../lib/selectors/plotpointSelector";
import {selectedObjectSelector} from "../lib/selectors/selectedObjectSelector";
import {treeSelector} from "../lib/selectors/treeSelector";
import {RootState} from "../lib/store";
import {aiHelp} from "../lib/actions/aiHelp";
import {HelpKind} from "../lib/ai-instructions";
import {LanguageForm} from "./LanguageForm";
import {AutoResizeTextarea} from "./AutoResizeTextarea";

export const StoryPanel = () => {
  const scene = useSelector(selectedObjectSelector);
  const aiInstructions = useSelector((store: RootState) => store.story.settings?.aiInstructions);
  const allScenes = useSelector((store: RootState) => store.story.scene);
  const tree = useSelector(treeSelector)
  const [isEditable, setIsEditable] = useState(true)
  const [plotPoint, setPlotPoint] = useState<string>();
  const [action, setAction] = useState<string>("mentioned");
  const plotpoints = useSelector(plotpointSelector);
  const languages = useSelector((store: RootState) => Object.values(store.language.languages));
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);

  const help = useCallback((helpKind: HelpKind, extra = false) => {
    setIsEditable(false)
    const currentParagraph = scene?.data.paragraphs.find(p => p.id === scene.data.selectedParagraph)

    if (!scene) return;
    if (!currentParagraph) {
      return;
    };
    aiHelp(helpKind, `${currentParagraph.text}`).then((res) => {
      if (extra) {
        dispatch(storyActions.updateSceneParagraph({
          sceneId: scene.id,
          paragraphId: currentParagraph?.id,
          extra: res.data.text
        }));
      } else {
        dispatch(storyActions.updateSceneParagraph({
          sceneId: scene.id,
          paragraphId: currentParagraph?.id,
          extra: res.data.text
        }));
      }

      setIsEditable(true)
    })
  }, [scene])

  const dispatch = useDispatch();
  useEffect(() => {
    const paragraph = document.getElementById(`p_${scene?.data.selectedParagraph}`) as HTMLTextAreaElement | null;
    if(paragraph && scene?.type === 'scene') {
      console.log('focus', scene.data.cursor)
      paragraph.focus()
      paragraph.selectionStart = scene.data.cursor;
      paragraph.selectionEnd = scene.data.cursor;
    }
  }, [scene.data.id]);

  if (scene?.type !== 'scene') {
    return null;
  }

  return (
    <Flex flexDirection={"column"} height={"100%"} overflow={"hidden"}>
      <Flex flexDirection={"row"} flex={1} gap={4} height={'100%'} overflow={"hidden"} justifyContent={'space-around'}>
        <Flex flex={1} overflow={'auto'} flexDirection={'column'} alignItems={'center'}>
        {scene.data.paragraphs.map((p) => {
            return <Flex gap={2} justifyContent={'center'} width={'100%'}><Box borderLeft={1} flex={1} maxW={'50%'} borderLeftStyle={'solid'} borderLeftColor={p.state === 'revise' ? 'red.500' : undefined}><AutoResizeTextarea key={p.id} id={`p_${p.id}`} value={p.text} onChange={(e) => {
              dispatch(storyActions.updateSceneParagraph({
                sceneId: scene.id,
                paragraphId: p.id,
                text: e.target.value
              }))
            }} onFocus={(e) => {
                dispatch(storyActions.updateScene({
                    id: scene.id,
                    selectedParagraph: p.id,
                  cursor: e.currentTarget.selectionStart
                }))

            }} onKeyDown={(e) => {
              if(e.key === 'Enter' && e.shiftKey) {
                dispatch(storyActions.createSceneParagraph({
                  sceneId: scene.id,
                  afterParagraphId: p.id
                }))
                e.preventDefault();
                e.stopPropagation();
              }
            }} /></Box>
          {p.extra ? <Box flex={1} maxW={'50%'}><AutoResizeTextarea onChange={(e) => {
            dispatch(storyActions.updateSceneParagraph({
              sceneId: scene.id,
              paragraphId: p.id,
              extra: e.currentTarget.value
            }))

          }} value={p.extra} /></Box> : null}
            </Flex>
          })}
        </Flex>
        {scene?.data.extra ? <Textarea maxWidth={"40em"} flex={1} height={"100%"} value={scene.data.extra} onChange={e => {
          dispatch(storyActions.updateScene({
            id: scene?.id,
            extra: e.target.value
          }))
        }} /> : null }
        {selectedLanguage ? <Flex flex={1} overflow={'auto'} height={"100%"}><LanguageForm languageId={selectedLanguage} /></Flex> : null}
      </Flex>
      <Box>
        <Button colorScheme={'blue'} onClick={() => {
          help('next_paragraph')
        }}>[AI] Next Paragraph</Button>
        <Button colorScheme={'blue'} onClick={() => {
          help('write')
        }}>[AI] Write</Button>
        <Button colorScheme={'blue'} onClick={() => {
          help('critique', true)
        }}>[AI] Critique</Button>
        <Button colorScheme={'blue'} onClick={() => {
          help('rewrite', true)
        }}>[AI] Rewrite</Button>
        {languages.map(lang => {
          return <Button onClick={() => {
            if (selectedLanguage) {
              setSelectedLanguage(undefined)
            } else {
              setSelectedLanguage(lang.id)
            }
          }}>{lang.title}</Button>
        })}
      </Box>
      <Box>
        <Heading size={"md"} mt={4}>
          Plot Points
        </Heading>
        <Flex flexDirection={'row'}>
        {scene?.data.plot_point_actions.map((link) => {
          const point = plotpoints[link.plot_point_id];
          return (
            <Box key={link.plot_point_id} p={2}>
              {point?.title} {link.action}
              <Button
                colorScheme={"red"}
                size={'xs'}
                ml={2}
                onClick={() => {
                  if (scene) {
                    dispatch(
                      storyActions.removePlotPointFromScene({
                        sceneId: scene.id,
                        plotpointId: link.plot_point_id,
                        action: link.action,
                      })
                    );
                  }
                }}
              >
                Delete
              </Button>
            </Box>
          );
        })}
        </Flex>

        <div style={{ marginTop: "8px", display: "flex" }}>
          <Select
            value={plotPoint}
            onChange={(e) => {
              setPlotPoint(e.currentTarget.value);
            }}
          >
            <option>-- select --</option>
            {Object.values(plotpoints).map((point) => (
              <option key={point.id} value={point.id}>
                {point.title}
              </option>
            ))}
          </Select>
          <Select
            value={action}
            onChange={(e) => {
              setAction(e.currentTarget.value);
            }}
          >
            <option>mentioned</option>
            <option>partially resolved</option>
            <option>resolved</option>
          </Select>
          <Button
            onClick={() => {
              if (scene && plotPoint) {
                dispatch(
                  storyActions.addPlotPointToScene({
                    sceneId: scene.id,
                    plotpointId: plotPoint,
                    action: action,
                  })
                );
              }
            }}
          >
            Add
          </Button>
        </div>
      </Box>
    </Flex>
  );
};
