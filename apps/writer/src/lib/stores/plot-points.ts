import { PlotPoint } from "@writer/shared";
import { createStore } from "solid-js/store";

export const [plotpoints, setPlotpoints] = createStore<{
  plotPoints: Record<string, PlotPoint>;
}>({ plotPoints: {} });
