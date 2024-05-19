import {
  boolean,
  foreignKey,
  jsonb,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").primaryKey(),
  providerId: varchar("provider_id", { length: 256 }).unique(),
  nickname: varchar("nickname", { length: 256 }),
  fullName: text("full_name"),
  email: varchar("email", { length: 256 }),
  password: varchar("password", { length: 256 }),
});

export const story = pgTable("story", {
  id: uuid("id").primaryKey(),
  authorId: uuid("author_id").references(() => user.id),
});

export const plotpoint = pgTable("plotpoint", {
  id: uuid("id").primaryKey(),
  storyId: uuid("story_id").references(() => story.id),
});

export const character = pgTable("character", {
  id: uuid("id").primaryKey(),
  storyId: uuid("story_id").references(() => story.id),
  isProtagonist: boolean("is_protagonist"),
  picture: varchar("picture", { length: 256 }),
  name: text("name"),
  summary: text("summary"),
  age: text("age"),
});

export const tree = pgTable("tree", {
  id: uuid("id").primaryKey(),
  storyId: uuid("story_id").references(() => story.id),
  treeJson: jsonb("tree_json"),
});

export const treeEntityKind = pgEnum("treeEntityKind", [
  "BOOK",
  "ARC",
  "CHAPTER",
  "SCENE",
]);

export const treeEntity = pgTable(
  "treeEntity",
  {
    id: uuid("id").primaryKey(),
    storyId: uuid("story_id").references(() => story.id),
    parentId: uuid("parent_id"),
    title: text("title"),
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
  treeEntityId: uuid("tree_entity_id")
    .primaryKey()
    .references(() => treeEntity.id),
  sceneJson: jsonb("scene_json"),
});
