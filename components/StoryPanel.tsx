import React, {useState, Suspense, useCallback} from "react";
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
import axios from "axios";
import {treeSelector} from "../lib/selectors/treeSelector";
import {RootState} from "../lib/store";

export const StoryPanel = () => {
  const scene = useSelector(selectedObjectSelector);
  const protagonist = useSelector((store: RootState) => Object.values(store.story.characters).find(char => char.isProtagonist));
  const allScenes = useSelector((store: RootState) => store.story.scene);
  const tree = useSelector(treeSelector)
  const [isEditable, setIsEditable] = useState(true)
  const [plotPoint, setPlotPoint] = useState<string>();
  const [action, setAction] = useState<string>("mentioned");
  const plotpoints = useSelector(plotpointSelector);

  if (scene?.type !== 'scene') {
    return null;
  }

  const help = useCallback((helpKind: string, extra = false) => {
    setIsEditable(false)
    axios.post('/api/help', {
      kind: helpKind,
      text: 'Book summary: '+tree.book?.summary+'\n\nProtagonist: '+protagonist?.summary+'\n\nArc summary: '+tree.arc?.summary+'\n\nChapter summary: '+tree.chapter?.summary + '\n\nScenes in chapter:\n\n'+tree.chapter?.scenes.map(sceneId => sceneId === scene.id ? '- (current scene)' : ('- '+allScenes[sceneId].summary)).join('\n')+'\n\nCurrent scene text:\n\n'+ scene?.data.text,
    }).then((res) => {
      if (extra) {
        dispatch(storyActions.updateScene({
          id: scene?.id,
          extra: res.data.text
        }));
      } else {
        dispatch(
          storyActions.updateScene({
            id: scene?.id,
            text: `${scene?.data.text}\n\n${res.data.text}`,
          })
        );
      }

      setIsEditable(true)
    })
  }, [scene])

  const dispatch = useDispatch();

  return (
    <Flex flexDirection={"column"} height={"100%"}>

      <Flex flexDirection={"row"} flex={1} height={'100%'} justifyContent={'space-around'}>
        <Textarea
          maxWidth={"40em"}
          isDisabled={!isEditable}
          height={"100%"}
          flex={1}
          onChange={(e) => {
            dispatch(
              storyActions.updateScene({
                id: scene?.id,
                text: e.target.value,
              })
            );
          }}
          value={scene?.data.text}
        />
        {scene?.data.extra ? <Textarea maxWidth={"40em"} flex={1} height={"100%"} value={scene.data.extra} onChange={e => {
          dispatch(storyActions.updateScene({
            id: scene?.id,
            extra: e.target.value
          }))
        }} /> : null }
      </Flex>
      <Box>
        <Button colorScheme={'blue'} onClick={() => {
          help('next_paragraph')
        }}>[AI] Next Paragraph</Button>
        <Button colorScheme={'blue'} onClick={() => {
          help('critique', true)
        }}>[AI] Critique</Button>
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
