import { createSignal } from "solid-js";
import { addPlotpointActionToSceneParagraph } from "../lib/stores/scenes";
import { currentScene } from "../lib/stores/retrieval/current-scene";
import { plotpoints } from "../lib/stores/plot-points";

export const PlotpointActions = () => {
  const [plotPoint, setPlotPoint] = createSignal<string>("");
  const [action, setAction] = createSignal<string>("mentioned");

  return (
    <div class="flex flex-row items-center gap-2 mt-2">
      <div class="min-w-[6em]">Plot Points</div>
      <select
        class="select select-bordered max-w-48"
        value={plotPoint()}
        onChange={(e) => {
          setPlotPoint(e.currentTarget.value);
        }}
      >
        <option>-- select --</option>
        {Object.values(plotpoints.plotPoints).map((point) => (
          <option value={point.id}>{point.title}</option>
        ))}
      </select>
      <select
        class="select select-bordered max-w-48"
        value={action()}
        onChange={(e) => {
          setAction(e.currentTarget.value);
        }}
      >
        <option>mentioned</option>
        <option>partially resolved</option>
        <option>resolved</option>
      </select>
      <button
        type="button"
        class="btn btn-outline"
        onClick={() => {
          const scene = currentScene();
          const paragraphId = scene?.selectedParagraph;
          if (!scene?.id || !paragraphId) return;
          addPlotpointActionToSceneParagraph(scene.id, paragraphId, {
            plot_point_id: plotPoint(),
            action: action(),
          });
        }}
      >
        Add
      </button>
    </div>
  );
};
