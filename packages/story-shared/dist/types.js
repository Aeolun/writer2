// ============================================================================
// @story/shared - Shared types for Story frontend, Editor, and Backend
// ============================================================================
// ============================================================================
// Utility Functions
// ============================================================================
/**
 * Extract plain text from a ContentNode
 */
export function contentNodeToText(contentNode) {
    return contentNode.content
        .map(block => block.content?.map(textNode => textNode.text).join('') || '')
        .join('\n');
}
/**
 * Extract plain text from a paragraph (handles both plain text and rich text)
 */
export function paragraphToText(paragraph) {
    return paragraph.body;
}
/**
 * Convert an array of paragraphs to plain text
 */
export function paragraphsToText(paragraphs) {
    return paragraphs.map(p => p.body).join('\n\n');
}
/**
 * Parse contentSchema string to ContentNode object
 * Returns null if contentSchema is not present or invalid
 */
export function parseContentSchema(paragraph) {
    if (!paragraph.contentSchema)
        return null;
    try {
        return JSON.parse(paragraph.contentSchema);
    }
    catch {
        return null;
    }
}
