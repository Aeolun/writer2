import { findNode, updateNode } from "../lib/stores/tree";
import { FormField } from "./styled/FormField";

interface NodeTypeButtonsProps {
  nodeId: string;
}

export const NodeTypeButtons = (props: NodeTypeButtonsProps) => {
  return (
    <FormField label="Node Type">
      <div class="flex gap-2">
        <button
          type="button"
          class={`btn flex-1 ${findNode(props.nodeId)?.nodeType === "story" ? "btn-primary" : "btn-outline"}`}
          onClick={() => {
            updateNode(props.nodeId, { nodeType: "story" });
          }}
        >
          Story Node
        </button>
        <button
          type="button"
          class={`btn flex-1 ${findNode(props.nodeId)?.nodeType === "context" ? "btn-primary" : "btn-outline"}`}
          onClick={() => {
            updateNode(props.nodeId, { nodeType: "context" });
          }}
        >
          Context Node
        </button>
        <button
          type="button"
          class={`btn flex-1 ${findNode(props.nodeId)?.nodeType === "non-story" ? "btn-primary" : "btn-outline"}`}
          onClick={() => {
            updateNode(props.nodeId, { nodeType: "non-story" });
          }}
        >
          Non-story Node
        </button>
      </div>
    </FormField>
  );
}; 