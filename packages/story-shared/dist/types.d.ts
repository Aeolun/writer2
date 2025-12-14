/**
 * Mark applied to text (bold, italic, translation, etc.)
 */
export interface TextMark {
    type: string;
    attrs?: Record<string, unknown>;
}
/**
 * Text node within a paragraph
 */
export interface TextNode {
    type: 'text';
    text: string;
    marks?: TextMark[];
}
/**
 * Block node (paragraph) containing text nodes
 */
export interface BlockNode {
    type: 'paragraph';
    content?: TextNode[];
}
/**
 * ProseMirror document structure
 */
export interface ContentNode {
    type: 'doc';
    content: BlockNode[];
}
/**
 * Plot point action - tracks how plot points are affected by a paragraph
 */
export interface PlotPointAction {
    plot_point_id: string;
    action: 'introduce' | 'mentioned' | 'partially resolved' | 'resolved';
}
/**
 * Inventory action - tracks item changes
 */
export interface InventoryAction {
    type: 'add' | 'remove';
    item_name: string;
    item_amount: number;
}
/**
 * Comment on a paragraph
 */
export interface Comment {
    id: string;
    text: string;
    user: string;
    createdAt: string;
}
/**
 * Paragraph state in the writing workflow
 */
export type ParagraphState = 'ai' | 'draft' | 'revise' | 'final' | 'sdt';
/**
 * Paragraph - the core content unit
 *
 * This type matches the backend ParagraphRevision schema:
 * - `body` contains plain text (always present, used for display/search)
 * - `contentSchema` contains ProseMirror JSON string (optional, for rich text editing)
 */
export interface Paragraph {
    /** Unique paragraph ID */
    id: string;
    /** Plain text content (always present) */
    body: string;
    /** ProseMirror JSON structure as string (for rich text with formatting) */
    contentSchema?: string | null;
    /** Workflow state */
    state: ParagraphState;
    /** Comments on this paragraph */
    comments: Comment[];
    /** Plot point actions triggered by this paragraph */
    plotPointActions?: PlotPointAction[];
    /** Inventory changes triggered by this paragraph */
    inventoryActions?: InventoryAction[];
    /** AI suggestion overlay text */
    extra?: string;
    /** Whether AI suggestion is loading */
    extraLoading?: boolean;
    /** Translation overlay text */
    translation?: string;
    /** Word count */
    words?: number;
    /** Character count from AI-generated content */
    aiCharacters?: number;
    /** Character count from human-written content */
    humanCharacters?: number;
}
/**
 * Extract plain text from a ContentNode
 */
export declare function contentNodeToText(contentNode: ContentNode): string;
/**
 * Extract plain text from a paragraph (handles both plain text and rich text)
 */
export declare function paragraphToText(paragraph: Paragraph): string;
/**
 * Convert an array of paragraphs to plain text
 */
export declare function paragraphsToText(paragraphs: Paragraph[]): string;
/**
 * Parse contentSchema string to ContentNode object
 * Returns null if contentSchema is not present or invalid
 */
export declare function parseContentSchema(paragraph: Paragraph): ContentNode | null;
//# sourceMappingURL=types.d.ts.map