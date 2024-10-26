import { SceneParagraph } from "@writer/shared";
import { plotpoints } from "../lib/stores/plot-points";
import { FiTrash } from "solid-icons/fi";
import {
  removeInventoryFromSceneParagraph,
  removePlotpointFromSceneParagraph,
} from "../lib/stores/scenes";

export const ParagraphDetails = (props: {
  sceneId: string;
  paragraph: SceneParagraph;
}) => {
  return (
    <div class="mb-2">
      {props.paragraph.plot_point_actions &&
      props.paragraph.plot_point_actions.length > 0 ? (
        <div class="flex flex-row px-4 gap-1 flex-wrap">
          {props.paragraph.plot_point_actions.map((link) => {
            const point = plotpoints.plotPoints[link.plot_point_id];
            return (
              <div class="tag flex items-center rounded-md text-sm py-1 px-2 bg-blue-200">
                {point?.title} {link.action}
                <button
                  type="button"
                  class="ml-2 hover:text-error"
                  onClick={() => {
                    if (props.paragraph) {
                      removePlotpointFromSceneParagraph(
                        props.sceneId,
                        props.paragraph.id,
                        link.plot_point_id,
                      );
                    } else {
                      console.error("no scene or paragraph");
                    }
                  }}
                >
                  <FiTrash />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
      {props.paragraph.inventory_actions &&
      props.paragraph.inventory_actions.length > 0 ? (
        <div class="flex flex-row px-8 pb-4 gap-1 flex-wrap">
          {props.paragraph.inventory_actions.map((link) => {
            return (
              <div
                class={`tag flex items-center rounded-md text-sm py-1 px-2 ${
                  link.type === "add"
                    ? "bg-success text-success-content"
                    : "bg-error text-error-content"
                }`}
              >
                {link.item_name} x{link.item_amount}
                <button
                  type="button"
                  class="ml-2"
                  onClick={() => {
                    if (props.paragraph) {
                      removeInventoryFromSceneParagraph(
                        props.sceneId,
                        props.paragraph.id,
                        link.item_name,
                      );
                    } else {
                      console.error("no scene or paragraph");
                    }
                  }}
                >
                  <FiTrash />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
