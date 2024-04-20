import z from "zod";

const plotPointSchema = z.object({
  id: z.string(),
  summary: z.string(),
  title: z.string(),
});

export type PlotPoint = z.infer<typeof plotPointSchema>;

const characterSchema = z.object({
  id: z.string(),
  isProtagonist: z.boolean(),
  picture: z.string(),
  name: z.string(),
  summary: z.string(),
  age: z.string(),
});
export type Character = z.infer<typeof characterSchema>;

const treeDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  extra: z.string().optional(),
});

export type TreeData = z.infer<typeof treeDataSchema>;

const bookSchema = treeDataSchema.extend({
  summary: z.string(),
  critique: z.string().optional(),
  start_date: z.string().optional(),
});

export type Book = z.infer<typeof bookSchema>;

const arcSchema = treeDataSchema.extend({
  summary: z.string(),
  start_date: z.string().optional(),
});

export type Arc = z.infer<typeof arcSchema>;

const chapterSchema = treeDataSchema.extend({
  summary: z.string(),
  start_date: z.string().optional(),
});

export type Chapter = z.infer<typeof chapterSchema>;

const sceneParagraphSchema = z.object({
  id: z.string(),
  text: z.string(),
  extra: z.string().optional(),
  extraLoading: z.boolean().optional(),
  state: z.enum(["ai", "draft", "revise", "final"]),
  modifiedAt: z.string(),
  comments: z.array(
    z.object({
      text: z.string(),
      user: z.string(),
      createdAt: z.string(),
    }),
  ),
  plot_point_actions: z.array(
    z.object({
      plot_point_id: z.string(),
      action: z.string(),
    }),
  ),
});

export type SceneParagraph = z.infer<typeof sceneParagraphSchema>;

const sceneSchema = treeDataSchema.extend({
  summary: z.string(),
  paragraphs: z.array(sceneParagraphSchema),
  text: z.string(),
  selectedParagraph: z.string().optional(),
  words: z.number().optional(),
  hasAI: z.boolean().optional(),
  posted: z.boolean().optional(),
  cursor: z.number().optional(),
  plot_point_actions: z.array(
    z.object({
      plot_point_id: z.string(),
      action: z.string(),
    }),
  ),
});

export type Scene = z.infer<typeof sceneSchema>;

const baseNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["book", "arc", "chapter", "scene"]),
  isOpen: z.boolean(),
});

export type Node = z.infer<typeof baseNodeSchema> & {
  children?: Node[];
};

const treeSchema: z.ZodType<Node> = baseNodeSchema.extend({
  children: z.lazy(() => treeSchema.array().optional()),
});

export const languageSchema = z.object({
  languages: z.record(
    z.object({
      id: z.string(),
      summary: z.string(),
      title: z.string(),
      phonemes: z.array(
        z.object({
          id: z.string(),
          identifier: z.string(),
          options: z.string(),
        }),
      ),
      wordOptions: z.array(
        z.object({
          id: z.string(),
          identifier: z.string(),
          option: z.string(),
        }),
      ),
      vocabulary: z.array(
        z.object({
          id: z.string(),
          native: z.string(),
          meaning: z.string(),
        }),
      ),
      pronouns: z.array(
        z.object({
          id: z.string(),
          native: z.string(),
          meaning: z.string(),
        }),
      ),
    }),
  ),
});

export const storySchema = z.object({
  name: z.string().optional(),
  modifiedTime: z.number().optional(),
  settings: z
    .object({
      mangaChapterPath: z.string().optional(),
      aiInstructions: z.string().optional(),
    })
    .optional(),
  structure: z.array(treeSchema),
  chapter: z.record(chapterSchema),
  book: z.record(bookSchema),
  arc: z.record(arcSchema),
  characters: z.record(characterSchema),
  plotPoints: z.record(plotPointSchema),
  scene: z.record(sceneSchema),
});
export type Story = z.infer<typeof storySchema>;

export const saveSchema = z.object({
  story: storySchema,
  language: languageSchema,
  expectedLastModified: z.number(),
});

export const entities = [
  "scene",
  "book",
  "arc",
  "chapter",
  "characters",
  "plotPoints",
] as const;
