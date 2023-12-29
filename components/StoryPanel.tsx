import React, { useState, Suspense } from "react";
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
import {selectedSceneSelector} from "../lib/selectors/selectedSceneSelector";

export const StoryPanel = () => {
  const scene = useSelector(selectedSceneSelector);
  const [plotPoint, setPlotPoint] = useState<string>();
  const [action, setAction] = useState<string>("mentioned");
  const plotpoints = useSelector(plotpointSelector);

  const dispatch = useDispatch();

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      <Textarea
        width={"100%"}
        flex={1}
        onChange={(e) => {
          dispatch(
            storyActions.updateScene({
              id: scene?.id,
              text: e.target.value,
            })
          );
        }}
        value={scene?.text}
      />

      <Box>
        <Heading size={"md"} mt={4}>
          Plot Points
        </Heading>
        {scene?.plot_point_actions.map((link) => {
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
