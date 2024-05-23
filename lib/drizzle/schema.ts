import {
  boolean,
  char,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: char("id", { length: 22 }).primaryKey(),
  providerId: varchar("provider_id", { length: 256 }).unique(),
  nickname: varchar("nickname", { length: 256 }),
  fullName: text("full_name"),
  email: varchar("email", { length: 256 }),
  password: varchar("password", { length: 256 }),
});

export const storyTable = pgTable("story", {
  id: char("id", { length: 22 }).primaryKey(),
  name: varchar("name", { length: 256 }),
  authorId: char("author_id", { length: 22 }).references(() => user.id),
});

export type StoryTable = typeof storyTable.$inferSelect;

export const plotpoint = pgTable("plotpoint", {
  id: char("id", { length: 22 }).primaryKey(),
  storyId: char("story_id", { length: 22 }).references(() => storyTable.id),
  name: text("name"),
  summary: text("summary"),
});

export const character = pgTable("character", {
  id: char("id", { length: 22 }).primaryKey(),
  storyId: char("story_id", { length: 22 }).references(() => storyTable.id),
  isProtagonist: boolean("is_protagonist"),
  picture: varchar("picture", { length: 256 }),
  name: text("name"),
  summary: text("summary"),
  age: text("age"),
});

export const tree = pgTable("tree", {
  id: char("id", { length: 22 }).primaryKey(),
  storyId: char("story_id", { length: 22 }).references(() => storyTable.id),
  treeJson: jsonb("tree_json"),
});

export const treeEntityKind = pgEnum("treeEntityKind", [
  "book",
  "arc",
  "chapter",
  "scene",
]);

export const treeEntity = pgTable(
  "treeEntity",
  {
    id: char("id", { length: 22 }).primaryKey(),
    storyId: char("story_id", { length: 22 }).references(() => storyTable.id),
    parentId: char("parent_id", { length: 22 }),
    title: text("title"),
    sortOrder: integer("sort_order"),
    kind: treeEntityKind("kind"),
    summary: text("summary"),
  },
  (table) => {
    return {
      parentReference: foreignKey({
        columns: [table.parentId],
        foreignColumns: [table.id],
        name: "parent_id_fk",
      }),
    };
  },
);

export const scene = pgTable("scene", {
  treeEntityId: char("id", { length: 22 })
    .primaryKey()
    .references(() => treeEntity.id),
  sceneJson: jsonb("scene_json"),
});
