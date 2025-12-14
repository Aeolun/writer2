// Main editor components
export { SceneEditor } from './SceneEditor.new'
export { ProseMirrorEditor } from './components/ProseMirrorEditor'
export { RewriteModal, GenerateBetweenModal } from './components/EditorModals'

// Simpler editor (if needed)
export { Editor } from './Editor'

// Schema
export { contentSchema } from './schema'

// Utilities
export * from './utils/paragraph-conversion'

// Types from @story/shared
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

// Editor-specific types
export type { SceneEditorProps, EditorCharacter, EditorLocation, EditorScene, EditorTreeNode, AiHelpType } from './SceneEditorProps'
export type { ProseMirrorEditorProps } from './components/ProseMirrorEditor'
export type { TranslationLanguage, InlineMenuConfig } from './plugins/inline-menu'

// CSS styles - exported for direct use if needed
export * from './scene-editor.css'
export * from './style.css'
