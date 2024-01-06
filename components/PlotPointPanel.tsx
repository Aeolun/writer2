import React from "react";
import { Input, Button, Textarea, Box, Flex } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { plotpointSelector } from "../lib/selectors/plotpointSelector";
import { storyActions } from "../lib/slices/story";

export const PlotPointPanel = () => {
  const plotpoints = useSelector(plotpointSelector);
  const dispatch = useDispatch();

  return (
    <Flex flexWrap={'wrap'} alignItems={'flex-start'} justifyContent={'start'}>
      {Object.values(plotpoints).map((plotPoint) => {
        return (
          <Flex mb={4} width={"20%"} direction={'column'} key={plotPoint.id}>
            <Flex mb={2}>
              <Input
                placeholder={"title"}
                value={plotPoint.title}
                onChange={(e) => {
                  dispatch(
                    storyActions.updatePlotpoint({
                      id: plotPoint.id,
                      title: e.currentTarget.value,
                    })
                  );
                }}
              />
              <Button
                ml={2}
                colorScheme={"red"}
                onClick={() => {
                  if (confirm("You sure you want to delete this one?")) {
                    dispatch(
                      storyActions.deletePlotPoint({
                        plotpointId: plotPoint.id,
                      })
                    );
                  }
                }}
              >
                Delete
              </Button>
            </Flex>
            <Textarea
              style={{ width: "100%" }}
              onChange={(e) => {
                dispatch(
                  storyActions.updatePlotpoint({
                    id: plotPoint.id,
                    summary: e.currentTarget.value,
                  })
                );
              }}
            >
              {plotPoint.summary}
            </Textarea>
          </Flex>
        );
      })}
      <Button
        onClick={() => {
          dispatch(storyActions.createPlotPoint({}));
        }}
      >
        Add plot point
      </Button>
    </Flex>
  );
};
