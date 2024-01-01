import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input, Textarea } from "@chakra-ui/react";
import { storyActions } from "../lib/slices/story";
import {selectedObjectSelector} from "../lib/selectors/selectedObjectSelector";

export const ScenePanel = () => {
  const selectedScene = useSelector(selectedObjectSelector);
  const dispatch = useDispatch();

  return selectedScene && selectedScene.type === 'scene' ? (
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
          value={selectedScene.data.title}
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
        value={selectedScene.data.summary}
      />
    </>
  ) : null;
};
