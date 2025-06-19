import { Plugin, PluginKey } from "prosemirror-state";
import type { SceneParagraph } from "@writer/shared";

const paragraphStatePluginKey = new PluginKey("paragraphState");

export function createParagraphStatePlugin(paragraphs: () => SceneParagraph[]) {
  return new Plugin({
    key: paragraphStatePluginKey,
    
    props: {
      nodeViews: {
        paragraph(node, view, getPos) {
          const dom = document.createElement("p");
          const contentDOM = dom;
          
          // Set paragraph ID and state attributes
          if (node.attrs.id) {
            dom.setAttribute("id", node.attrs.id);
            
            // Find the paragraph state from the store
            const paragraph = paragraphs().find(p => p.id === node.attrs.id);
            if (paragraph) {
              dom.setAttribute("data-state", paragraph.state);
            }
          }
          
          return { dom, contentDOM };
        },
      },
    },
  });
} 