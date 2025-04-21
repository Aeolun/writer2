import z from "zod";
const entitySchema = z.object({
    id: z.string(),
    modifiedAt: z.number().or(z.string()).optional(),
});
const plotPointSchema = entitySchema.extend({
    id: z.string(),
    summary: z.string(),
    title: z.string(),
    state: z.enum(["introduced", "unresolved", "resolved"]).default("unresolved"),
});
const characterSchema = entitySchema.extend({
    picture: z.string(),
    firstName: z.string(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    nickname: z.string().optional(),
    summary: z.string(),
    age: z.string(),
    gender: z.string().optional(),
    sexualOrientation: z.string().optional(),
    height: z.number().optional().default(170),
    hairColor: z.string().optional(),
    eyeColor: z.string().optional(),
    distinguishingFeatures: z.string().optional(),
    isMainCharacter: z.boolean().default(true),
    laterVersionOf: z.string().optional(),
    significantActions: z
        .array(z.object({
        action: z.string(),
        sceneId: z.string(),
        timestamp: z.number(),
    }))
        .optional(),
});
const treeDataSchema = entitySchema.extend({
    title: z.string(),
    extra: z.string().optional(),
});
const bookSchema = treeDataSchema.extend({
    summary: z.string(),
    author: z.string().optional(),
    editor: z.string().optional(),
    coverArtist: z.string().optional(),
    critique: z.string().optional(),
    coverImage: z.string().optional(),
    separatorImage: z.string().optional(),
    start_date: z.string().optional(),
});
const arcSchema = treeDataSchema.extend({
    summary: z.string(),
    start_date: z.string().optional(),
    highlights: z
        .array(z.object({
        text: z.string(),
        importance: z.string(),
        category: z.enum(["character", "plot", "setting", "theme"]),
        timestamp: z.number(),
    }))
        .optional(),
});
const chapterSchema = treeDataSchema.extend({
    summary: z.string(),
    start_date: z.string().optional(),
    visibleFrom: z.string().datetime().optional(),
    royalRoadId: z.number().optional(),
});
const inventoryActionSchema = z.object({
    type: z.enum(["add", "remove"]),
    item_name: z.string(),
    item_amount: z.number(),
});
const plotpointActionSchema = z.object({
    plot_point_id: z.string(),
    action: z.enum(["introduce", "mentioned", "partially resolved", "resolved"]),
});
export const textNodeSchema = z.object({
    type: z.literal("text"),
    text: z.string(),
    marks: z
        .array(z.object({
        type: z.literal("translation"),
        attrs: z.object({
            title: z.string(),
            from: z.string(),
            to: z.string(),
        }),
    }))
        .optional(),
});
export const blockNodeSchema = z.object({
    type: z.literal("paragraph"),
    content: z.array(textNodeSchema).optional(),
});
export const contentNodeSchema = z
    .object({
    type: z.literal("doc"),
    content: z.array(blockNodeSchema),
})
    .passthrough();
const sceneParagraphSchema = entitySchema.extend({
    text: z.string().or(contentNodeSchema),
    words: z.number().optional(),
    aiCharacters: z.number().optional(),
    humanCharacters: z.number().optional(),
    extra: z.string().optional(),
    translation: z.string().optional(),
    extraLoading: z.boolean().optional(),
    state: z.enum(["ai", "draft", "revise", "final", "sdt"]),
    comments: z.array(z.object({
        text: z.string(),
        user: z.string(),
        createdAt: z.string(),
    })),
    plot_point_actions: z.array(plotpointActionSchema).optional(),
    inventory_actions: z.array(inventoryActionSchema).optional(),
});
const sceneSchema = treeDataSchema.extend({
    summary: z.string(),
    paragraphs: z.array(sceneParagraphSchema),
    text: z.string(),
    selectedParagraph: z.string().optional(),
    words: z.number().optional(),
    generateNextText: z.string().optional(),
    hasAI: z.boolean().optional(),
    posted: z.boolean().optional(),
    cursor: z.number().optional(),
    plot_point_actions: z.array(z.object({
        plot_point_id: z.string(),
        action: z.string(),
    })),
    perspective: z.enum(["first", "third"]).optional(),
    protagonistId: z.string().optional(),
    characterIds: z.array(z.string()).optional(),
    referredCharacterIds: z.array(z.string()).optional(),
    locationId: z.string().optional(),
    generationApproaches: z
        .array(z.object({
        name: z.string(),
        content: z.string(),
        timestamp: z.number(),
    }))
        .optional(),
});
const baseNodeSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["book", "arc", "chapter", "scene"]),
    isOpen: z.boolean(),
    nodeType: z.enum(["story", "non-story", "context"]).default("story"),
    oneliner: z.string().optional(),
    summaries: z
        .array(z.object({
        level: z.number(),
        text: z.string(),
        timestamp: z.number(),
    }))
        .optional(),
});
// @ts-expect-error: not sure why
const treeSchema = baseNodeSchema.extend({
    children: z.lazy(() => treeSchema.array().optional()),
});
export const languageSchema = z.object({
    languages: z.record(z.object({
        id: z.string(),
        summary: z.string(),
        title: z.string(),
        phonemes: z.array(z.object({
            id: z.string(),
            identifier: z.string(),
            options: z.string(),
        })),
        wordOptions: z.array(z.object({
            id: z.string(),
            identifier: z.string(),
            option: z.string(),
        })),
        vocabulary: z.array(z.object({
            id: z.string(),
            native: z.string(),
            meaning: z.string(),
        })),
        pronouns: z.array(z.object({
            id: z.string(),
            native: z.string(),
            meaning: z.string(),
        })),
    })),
});
const itemSchema = entitySchema.extend({
    name: z.string(),
});
export const storySettingsSchema = z.object({
    headerImage: z.string().optional(),
    mangaChapterPath: z.string().optional(),
    aiInstructions: z.string().optional(),
    royalRoadId: z.string().optional(),
    defaultPerspective: z.enum(["first", "third"]).default("third"),
    defaultProtagonistId: z.string().optional(),
});
export const uploadedFileSchema = z.object({
    hash: z.string(),
    publicUrl: z.string(),
});
const locationSchema = entitySchema.extend({
    name: z.string(),
    picture: z.string(),
    description: z.string(),
});
export const storySchema = z.object({
    id: z.string(),
    name: z.string(),
    modifiedTime: z.number(),
    lastPublishTime: z.number().optional(),
    settings: storySettingsSchema.optional(),
    uploadedFiles: z.record(uploadedFileSchema).optional(),
    item: z.record(itemSchema).optional(),
    structure: z.array(treeSchema),
    chapter: z.record(chapterSchema),
    book: z.record(bookSchema),
    arc: z.record(arcSchema),
    characters: z.record(characterSchema),
    locations: z.record(locationSchema),
    plotPoints: z.record(plotPointSchema),
    scene: z.record(sceneSchema),
    oneliner: z.string().optional(),
});
export const persistedSchema = z.object({
    story: storySchema,
    language: languageSchema,
});
export const saveSchema = persistedSchema.extend({
    newAutosave: z.boolean(),
    expectedLastModified: z.number(),
    changesSince: z.number().optional(),
});
export const entities = [
    "item",
    "scene",
    "book",
    "arc",
    "chapter",
    "characters",
    "locations",
    "plotPoints",
];
export const languageEntities = ["languages"];
