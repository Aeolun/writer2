import { PlotPoint } from "@writer/shared";
import shortUUID from "short-uuid";
import { createStore } from "solid-js/store";

export const [plotpoints, setPlotpoints] = createStore<{
  plotPoints: Record<string, PlotPoint>;
}>({ plotPoints: {} });

export const updatePlotpoint = (id: string, changes: Partial<PlotPoint>) => {
  setPlotpoints("plotPoints", id, changes);
};

export const deletePlotpoint = (id: string) => {
  // @ts-expect-error: yes, this is a valid operation
  setPlotpoints("plotPoints", id, undefined);
};

export const createPlotpoint = () => {
  const id = shortUUID.generate();
  setPlotpoints("plotPoints", (curr) => {
    return {
      ...curr,
      [id]: {
        id,
        title: "",
        summary: "",
      },
    };
  });
};
