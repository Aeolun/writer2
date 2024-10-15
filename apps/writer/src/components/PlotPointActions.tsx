import { Button, Flex, Select, Text } from "@chakra-ui/react";
import { scene } from "../db/schema";
import { storyActions } from "../lib/slices/story";
import { useState } from "react";
import { plotpointSelector } from "../lib/selectors/plotpointSelector";
import { useAppDispatch, useAppSelector } from "../lib/store";
import { selectedSceneSelectedParagraphSelector } from "../lib/selectors/selectedSceneSelectedParagraphSelector";

export const PlotpointActions = () => {
  const [plotPoint, setPlotPoint] = useState<string>();
  const [action, setAction] = useState<string>("mentioned");
  const plotpoints = useAppSelector(plotpointSelector);
  const selectedParagraph = useAppSelector(
    selectedSceneSelectedParagraphSelector,
  );
  const dispatch = useAppDispatch();

  return (
    <Flex gap={1} alignItems="center" mt="2">
      <Text minW="6em">Plot Points</Text>
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
          if (scene && plotPoint && selectedParagraph?.selectedParagraph) {
            dispatch(
              storyActions.addPlotPointToSceneParagraph({
                sceneId: selectedParagraph.id,
                paragraphId: selectedParagraph.selectedParagraph,
                plotpointId: plotPoint,
                action: action,
              }),
            );
          }
        }}
      >
        Add
      </Button>
    </Flex>
  );
};
