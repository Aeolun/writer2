import React, { useState, Suspense } from "react";
import { Scene, storyActions } from "../lib/slices/story";
import { Textarea } from "@chakra-ui/react";
import { GrammarlyEditorPlugin } from "@grammarly/editor-sdk-react";
import { useDispatch } from "react-redux";

export const StoryPanel = (props: { scene?: Scene }) => {
  const [plotPoint, setPlotPoint] = useState<number>();
  const [action, setAction] = useState<string>("mentioned");

  const dispatch = useDispatch();

  return (
    <>
      <Textarea
        height={"100%"}
        width={"100%"}
        onChange={(e) => {
          dispatch(
            storyActions.updateScene({
              id: props.scene?.id,
              text: e.target.value,
            })
          );
        }}
        value={props.scene?.text}
      />

      {/*<div>*/}
      {/*  <strong>PP</strong>*/}
      {/*</div>*/}
      {/*{props.scene?.plot_point_actions.map((link) => {*/}
      {/*  const point = plotPoints.plot_points.find(*/}
      {/*    (p) => p.id === link.plot_point_id*/}
      {/*  );*/}
      {/*  return (*/}
      {/*    <div key={link.plot_point_id}>*/}
      {/*      {point?.title} {link.action} [*/}
      {/*      <span*/}
      {/*        style={{ cursor: "pointer" }}*/}
      {/*        onClick={() => {*/}
      {/*          // db.delete("plot_point_action", {*/}
      {/*          //   id: link.id,*/}
      {/*          // })*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        X*/}
      {/*      </span>*/}
      {/*      ]*/}
      {/*    </div>*/}
      {/*  );*/}
      {/*})}*/}

      {/*<div style={{ marginTop: "8px", display: "flex" }}>*/}
      {/*  <select*/}
      {/*    value={plotPoint}*/}
      {/*    onChange={(e) => {*/}
      {/*      setPlotPoint(parseInt(e.currentTarget.value));*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <option></option>*/}
      {/*    {plotPoints.plot_points.map((point) => (*/}
      {/*      <option key={point.id} value={point.id}>*/}
      {/*        {point.title}*/}
      {/*      </option>*/}
      {/*    ))}*/}
      {/*  </select>*/}
      {/*  <select*/}
      {/*    value={action}*/}
      {/*    onChange={(e) => {*/}
      {/*      setAction(e.currentTarget.value);*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <option>mentioned</option>*/}
      {/*    <option>partially resolved</option>*/}
      {/*    <option>resolved</option>*/}
      {/*  </select>*/}
      {/*  <button*/}
      {/*    onClick={() => {*/}
      {/*      // db.insert("plot_point_action", {*/}
      {/*      //   chapter: storyChapter,*/}
      {/*      //   scene: storyScene,*/}
      {/*      //   action: action,*/}
      {/*      //   plot_point_id: plotPoint,*/}
      {/*      // })*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    Add plot action*/}
      {/*  </button>*/}
      {/*</div>*/}
    </>
  );
};
