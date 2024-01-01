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

export const StoryPanel = () => {
  const scene = useSelector(selectedObjectSelector);
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
      text: scene?.data.text,
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
        {scene?.data.plot_point_actions.map((link) => {
          const point = plotpoints[link.plot_point_id];
          return (
            <div key={link.plot_point_id}>
              {point?.title} {link.action}
              <Button
                colorScheme={"red"}
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
            </div>
          );
        })}

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
