import TextareaAutosize from "react-textarea-autosize"
import React from "react"
import { Tab, TabList, TabPanel, Tabs } from "react-tabs"
import { useQuery } from "blitz"
import getPlot_points from "../plot_points/queries/getPlot_points"

export const PlotPointPanel = () => {
  const [plotPoints, plotPointContext] = useQuery(getPlot_points, {
    where: {},
    orderBy: {
      id: "asc",
    },
    skip: 0,
    take: 250,
  })

  return (
    <TabPanel>
      {plotPoints.plot_points.map((plotPoint) => {
        return (
          <div key={plotPoint.id}>
            <div>
              {plotPoint.id} [
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  // db.delete("plot_point", {
                  //   id: plotPoint.id,
                  // })
                }}
              >
                X
              </span>
              ]
            </div>
            <div>
              <input
                placeholder={"title"}
                defaultValue={plotPoint.title || undefined}
                onBlur={(e) => {
                  // db.update(
                  //   "plot_point",
                  //   {
                  //     title: e.target.value,
                  //   },
                  //   {
                  //     id: plotPoint.id,
                  //   }
                  // )
                }}
              />
            </div>
            <TextareaAutosize
              style={{ width: "100%" }}
              minRows={2}
              onBlur={(e) => {
                // db.update(
                //   "plot_point",
                //   {
                //     summary: e.target.value,
                //   },
                //   {
                //     id: plotPoint.id,
                //   }
                // )
              }}
            >
              {plotPoint.summary}
            </TextareaAutosize>
          </div>
        )
      })}
      <button
        onClick={() => {
          // db.insert("plot_point", {
          //   title: "",
          //   summary: "",
          // })
        }}
      >
        Add plot point
      </button>
    </TabPanel>
  )
}
