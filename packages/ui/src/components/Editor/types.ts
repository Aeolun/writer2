// Type definitions for the editor package
// Re-export types from @story/shared to ensure single source of truth
export type {
  Paragraph,
  ParagraphState,
  PlotPointAction,
  InventoryAction,
  Comment,
  ContentNode,
  TextNode,
  BlockNode,
  TextMark,
} from '@story/shared'

export {
  contentNodeToText,
  paragraphToText,
  paragraphsToText,
  parseContentSchema,
} from '@story/shared'
