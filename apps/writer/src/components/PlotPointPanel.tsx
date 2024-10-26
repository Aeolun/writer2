import { For } from "solid-js/web";
import {
  createPlotpoint,
  deletePlotpoint,
  plotpoints,
  updatePlotpoint,
} from "../lib/stores/plot-points";

export const PlotPointPanel = () => {
  return (
    <div class="flex flex-col gap-2 p-2 w-full overflow-hidden">
      <div class="grid grid-cols-4 gap-2 flex-wrap items-start justify-start overflow-auto">
        <For each={Object.values(plotpoints.plotPoints)}>
          {(plotPoint) => (
            <div class="flex bg-base-200 rounded-md flex-col gap-2 p-2">
              <div class="flex">
                <input
                  class="input input-bordered"
                  placeholder="title"
                  value={plotPoint.title}
                  onInput={(e) =>
                    updatePlotpoint(plotPoint.id, {
                      title: e.currentTarget.value,
                    })
                  }
                />
                <button
                  type="button"
                  class="ml-2 btn btn-error"
                  onClick={() => {
                    if (confirm("You sure you want to delete this one?")) {
                      deletePlotpoint(plotPoint.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
              <textarea
                class="textarea textarea-bordered w-full"
                onInput={(e) =>
                  updatePlotpoint(plotPoint.id, {
                    summary: e.currentTarget.value,
                  })
                }
              >
                {plotPoint.summary}
              </textarea>
            </div>
          )}
        </For>
      </div>
      <button type="button" class="btn btn-primary" onClick={createPlotpoint}>
        Add plot point
      </button>
    </div>
  );
};
