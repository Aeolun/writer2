import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectedSceneSelector } from "../lib/selectors/selectedSceneSelector";
import { Input, Textarea } from "@chakra-ui/react";
import { storyActions } from "../lib/slices/story";

export const ScenePanel = () => {
  const selectedScene = useSelector(selectedSceneSelector);
  const dispatch = useDispatch();

  return selectedScene ? (
    <>
      <div>
        <Input
          placeholder={"title"}
          onChange={(e) => {
            dispatch(
              storyActions.updateScene({
                id: selectedScene.id,
                title: e.target.value,
              })
            );
          }}
          value={selectedScene.title}
        />
      </div>
      <Textarea
        mt={2}
        onChange={(e) => {
          dispatch(
            storyActions.updateScene({
              id: selectedScene.id,
              summary: e.target.value,
            })
          );
        }}
        placeholder="summary"
        style={{ width: "100%" }}
        value={selectedScene.summary}
      />
    </>
  ) : null;
};
