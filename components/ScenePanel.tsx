import React, {useCallback, useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import {Button, Input, Textarea} from "@chakra-ui/react";
import { storyActions } from "../lib/slices/story";
import {selectedObjectSelector} from "../lib/selectors/selectedObjectSelector";
import {RootState} from "../lib/store";
import {aiHelp} from "../lib/actions/aiHelp";
import {HelpKind} from "../lib/ai-instructions";

export const ScenePanel = () => {
  const selectedScene = useSelector(selectedObjectSelector);
  const protagonist = useSelector((store: RootState) => Object.values(store.story.characters).find(char => char.isProtagonist));
  const dispatch = useDispatch();

  const help = useCallback((helpKind: HelpKind, extra = false) => {
    if (selectedScene?.type === 'scene') {
      const text = 'Protagonist: '+protagonist?.name+'\n\nScene text:\n\n'+selectedScene.data.text+'\n\nOutput only the summary.';
      aiHelp(helpKind, text).then((res) => {
        dispatch(storyActions.updateScene({
          id: selectedScene?.id,
          summary: res.data.text
        }));
      })
    }
  }, [selectedScene])

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
      <div>
        <Input
          placeholder={"sort order"}
          onChange={(e) => {
            dispatch(
              storyActions.updateScene({
                id: selectedScene.id,
                sort_order: parseInt(e.target.value),
              })
            );
          }}
          value={selectedScene.data.sort_order}
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
        rows={6}
        placeholder="summary"
        style={{ width: "100%" }}
        value={selectedScene.data.summary}
      />
      <Button colorScheme={'blue'} onClick={() => {
        help('summarize')
      }}>[AI] Summarize</Button>
    </>
  ) : null;
};
