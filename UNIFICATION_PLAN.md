# Writer + Story Unification Plan

## Quick Summary

**What:** Merge Writer2 and Story Project into single unified system
**How:** New `unified-backend` package in writer2 monorepo
**Stack:** PostgreSQL + Prisma + Fastify + OpenAPI
**UI:** Story Project's workflow (preferred)

**Key Architecture Decisions:**
- ✅ Message → Scene (1:1 for migration)
- ✅ ContextItem replaces Location + PlotPoint
- ✅ Chapter gets activeCharacterIds/activeContextItemIds
- ✅ Story gets branchChoices (interactive branching)
- ✅ ParagraphRevision enhanced with AI metadata

**Structure:**
```
writer2/apps/
├── story/           # Copy Story frontend here
├── story-backend/   # Copy Story backend here (keep it running)
└── unified-backend/ # New: Fastify + Prisma + PostgreSQL
```

---

## Goals

1. Merge Writer2 and Story Project into single unified system
2. Use Story's workflow (preferred by Bart)
3. PostgreSQL + Prisma + Fastify backend
4. OpenAPI for type safety without tRPC brittleness
5. Support all features from both systems

## Tech Stack

- **Database:** PostgreSQL (JSONB, pg_vector for embeddings)
- **ORM:** Prisma
- **Backend:** Fastify + @fastify/swagger for OpenAPI
- **Frontend:** Port Story's workflow, wrap in Tauri for desktop
- **API:** OpenAPI contracts, no batching (for now)

## Content Model Decision

### Story Project Messages → Writer2 Paragraphs

**Approach:** Each Message becomes a Scene with a single Paragraph

```
Story.Message (old) → Scene → Paragraph → ParagraphRevision (new)
```

**Why this works:**
- Message history → ParagraphRevision history
- Preserves all AI generation metadata
- Natural fit with Writer2's existing structure
- Scene becomes the "conversation turn" unit

**Fields to add to ParagraphRevision:**

```prisma
model ParagraphRevision {
  // Existing Writer2 fields
  id               String
  paragraphId      String
  paragraph        Paragraph
  body             String
  contentSchema    String?
  version          Int
  state            ParagraphState?
  aiCharacters     Int?
  humanCharacters  Int?
  plotPointActions Json?
  inventoryActions Json?
  createdAt        DateTime

  // NEW: From Story Project Message
  role             String?          // 'user' | 'assistant'
  model            String?          // LLM model used
  tokensPerSecond  Float?
  totalTokens      Int?
  promptTokens     Int?
  cacheCreationTokens Int?
  cacheReadTokens     Int?
  think            String?          @db.Text
  showThink        Boolean          @default(false)
  instruction      String?          @db.Text  // Generation instruction
  script           String?          @db.Text  // JavaScript execution

  // Relations
  paragraphComments ParagraphComment[]
  embeddings        ParagraphEmbedding[]
}
```

**Migration logic:**
```
For each Story.Message:
  1. Create new Scene (or reuse if grouping makes sense)
  2. Create new Paragraph
  3. Create ParagraphRevision with:
     - body = Message.content
     - role = Message.role
     - model = Message.model
     - all token stats
     - think, instruction, script
     - version = 1 (initial)
  4. If Message has MessageVersions:
     - Create additional ParagraphRevisions with version++
  5. Migrate embeddings to ParagraphEmbedding
```

## Unified Schema

### Core Hierarchy (Writer2 base + Story Project enhancements)

```prisma
User
  └── Story
        ├── Book
        │   └── Arc
        │       └── Chapter (+ activeCharacterIds, activeContextItemIds)
        │           └── Scene
        │               └── Paragraph
        │                   └── ParagraphRevision (ENHANCED with AI metadata)
        ├── Character
        ├── ContextItem (REPLACES Location + PlotPoint)
        ├── Item
        ├── File
        └── Tag
```

### New Features (from Story Project)

```prisma
Story (additions):
  ├── Calendar                    // Custom calendar systems
  ├── Map                         // Spatial visualization
  │   ├── Landmark
  │   │   └── LandmarkState       // Time-based state changes
  │   ├── Fleet
  │   │   └── FleetMovement       // Movement timeline
  │   └── Hyperlane
  │       └── HyperlaneSegment

Scene (additions):
  └── storyTime Int?              // Timeline position (minutes from epoch)

Character (additions):
  └── birthdate Int?              // Character timeline

ParagraphRevision (additions):
  └── ParagraphEmbedding          // RAG/vector search
```

### Timeline System

Story Project's timeline concept (minutes from 0 BBY):

```prisma
model Story {
  // ... existing fields

  // Timeline
  timelineStartTime   Int?    // Story timeline start (negative = BBY, positive = ABY)
  timelineEndTime     Int?    // Story timeline end
  timelineGranularity String  @default("hour") // 'hour' | 'day' - slider increment

  // Calendar
  defaultCalendarId String?
  defaultCalendar   Calendar? @relation("DefaultCalendar", fields: [defaultCalendarId], references: [id])

  // Branching (from Story Project)
  branchChoices Json?  // Record<branchMessageId, selectedOptionId> - tracks chosen path

  calendars     Calendar[]
  maps          Map[]
  contextItems  ContextItem[]
}

model Scene {
  // ... existing fields
  storyTime Int? // When this scene occurs in story timeline
}

model Chapter {
  // ... existing fields
  activeCharacterIds    Json?  // JSON array of character IDs active in this chapter
  activeContextItemIds  Json?  // JSON array of context item IDs active in this chapter
  viewpointCharacterId  String? // Character ID for viewpoint character
}

model Character {
  // ... existing fields
  birthdate Int? // Birth date in story time
}
```

### ContextItem System (replaces Location + PlotPoint)

```prisma
model ContextItem {
  id          String   @id
  storyId     String
  story       Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)
  type        String   // 'theme' | 'location' | 'plot' | 'custom'
  name        String
  description String   @db.Text
  isGlobal    Boolean  @default(false) // Whether active in all chapters
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([storyId])
  @@index([storyId, type])
}
```

**Migration from Writer2:**
- `Location` → `ContextItem` with `type='location'`
- `PlotPoint` → `ContextItem` with `type='plot'`
- Scene.locationId → reference via activeContextItemIds
- PlotPoint actions → tracked via paragraph metadata

### Calendar System

```prisma
model Calendar {
  id        String   @id
  storyId   String
  story     Story    @relation("StoryCalendars", fields: [storyId], references: [id], onDelete: Cascade)
  config    Json     // CalendarConfig as JSONB
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  defaultForStories Story[] @relation("DefaultCalendar")

  @@index([storyId])
}
```

### Map System

```prisma
model Map {
  id          String      @id
  storyId     String
  story       Story       @relation(fields: [storyId], references: [id], onDelete: Cascade)
  name        String
  fileId      String?     // Reference to map image file
  borderColor String?     // EJS template for landmark borders
  landmarks   Landmark[]
  fleets      Fleet[]
  hyperlanes  Hyperlane[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([storyId])
}

model Landmark {
  id          String          @id
  mapId       String
  map         Map             @relation(fields: [mapId], references: [id], onDelete: Cascade)
  x           Float           // X coordinate (0-1 normalized)
  y           Float           // Y coordinate (0-1 normalized)
  name        String
  description String          @db.Text
  type        String          @default("system") // "system" | "station" | "nebula" | "junction"
  population  String?
  industry    String?         // "farming" | "political" | "industry" | "trade" | "mining"
  color       String?
  size        String?         // "small" | "medium" | "large"
  region      String?
  sector      String?
  planetaryBodies String?     // Comma-separated list
  states      LandmarkState[]

  @@index([mapId])
}

model LandmarkState {
  id          String   @id
  storyId     String
  mapId       String
  landmarkId  String
  landmark    Landmark @relation(fields: [mapId, landmarkId], references: [mapId, id], onDelete: Cascade)
  storyTime   Int?     // When this state change occurs (timeline integration)
  field       String   // Field being changed (e.g., "allegiance", "control")
  value       String   // Value for this field at this time
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([mapId, landmarkId, storyTime, field])
  @@index([storyId, storyTime])
  @@index([mapId, landmarkId])
}

model Fleet {
  id               String          @id
  mapId            String
  map              Map             @relation(fields: [mapId], references: [id], onDelete: Cascade)
  name             String
  description      String?         @db.Text
  designation      String?         // Short text for marker (e.g., "1st", "A", "Alpha")
  hyperdriveRating Float           @default(1.0) // 0.5 = fast, 2.0 = slow
  defaultX         Float           // Default X coordinate (0-1 normalized)
  defaultY         Float           // Default Y coordinate (0-1 normalized)
  color            String?
  size             String?
  movements        FleetMovement[]

  @@index([mapId])
}

model FleetMovement {
  id             String   @id
  storyId        String
  mapId          String
  fleetId        String
  fleet          Fleet    @relation(fields: [mapId, fleetId], references: [mapId, id], onDelete: Cascade)
  startStoryTime Int      // When fleet departs (minutes from epoch)
  endStoryTime   Int      // When fleet arrives (minutes from epoch)
  startX         Float    // Starting X coordinate (0-1 normalized)
  startY         Float    // Starting Y coordinate (0-1 normalized)
  endX           Float    // Ending X coordinate (0-1 normalized)
  endY           Float    // Ending Y coordinate (0-1 normalized)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([storyId])
  @@index([mapId, fleetId])
  @@index([startStoryTime])
  @@index([endStoryTime])
}

model Hyperlane {
  id              String             @id
  mapId           String
  map             Map                @relation(fields: [mapId], references: [id], onDelete: Cascade)
  speedMultiplier Float              @default(10.0) // How much faster than normal space
  segments        HyperlaneSegment[]
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  @@index([mapId])
}

model HyperlaneSegment {
  id              String    @id
  hyperlaneId     String
  hyperlane       Hyperlane @relation(fields: [hyperlaneId], references: [id], onDelete: Cascade)
  mapId           String
  order           Int       // Order within the hyperlane path (0, 1, 2, ...)
  startX          Float     // Starting X coordinate (0-1 normalized)
  startY          Float     // Starting Y coordinate (0-1 normalized)
  endX            Float     // Ending X coordinate (0-1 normalized)
  endY            Float     // Ending Y coordinate (0-1 normalized)
  startLandmarkId String?   // If start snaps to a landmark/junction
  endLandmarkId   String?   // If end snaps to a landmark/junction
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([hyperlaneId])
  @@index([mapId])
  @@index([startLandmarkId])
  @@index([endLandmarkId])
}
```

### Embeddings for RAG

```prisma
model ParagraphEmbedding {
  id                  String             @id
  paragraphRevisionId String
  paragraphRevision   ParagraphRevision  @relation(fields: [paragraphRevisionId], references: [id], onDelete: Cascade)
  paragraphIndex      Int                // Index within the paragraph (if split)
  content             String             @db.Text
  embedding           Bytes              // Vector stored as binary (or use pgvector extension)
  model               String             // Embedding model used
  dimension           Int                // Vector dimension
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  @@unique([paragraphRevisionId, paragraphIndex])
  @@index([paragraphRevisionId])
}
```

## Migration Strategy

### Phase 1: Setup New Infrastructure

1. **Create new PostgreSQL database**
2. **Write complete unified Prisma schema**
3. **Set up Fastify backend with OpenAPI**
4. **Generate Prisma client**

### Phase 2: Migrate Writer2 Data

**From:** Writer2 Server (MySQL) → Unified (PostgreSQL)

**Process:**
```typescript
// Most tables map 1:1, just copy data
// Main changes:
// - MySQL → PostgreSQL (use prisma migrate)
// - Keep all existing structure
// - Add new nullable fields (timeline, etc.)
```

**Script structure:**
```typescript
async function migrateWriter2() {
  // Connect to both databases
  const sourceDb = new PrismaClient({ datasourceUrl: WRITER2_MYSQL })
  const targetDb = new PrismaClient({ datasourceUrl: UNIFIED_POSTGRES })

  // Migrate in dependency order
  await migrateUsers()
  await migrateStories()
  await migrateBooks()
  await migrateArcs()
  await migrateChapters()
  await migrateScenes()
  await migrateParagraphs()
  await migrateParagraphRevisions()
  await migrateCharacters()
  await migrateLocations()
  await migratePlotPoints()
  await migrateFiles()
  // ... etc
}
```

### Phase 3: Migrate Story Project Data

**From:** Story Project (SQLite) → Unified (PostgreSQL)

**Key transformations:**

1. **Message → Scene → Paragraph → ParagraphRevision**
   ```typescript
   async function migrateMessages(storyId: string) {
     const messages = await storyDb.message.findMany({
       where: { storyId },
       orderBy: { order: 'asc' },
       include: {
         versions: true,
         paragraphEmbeddings: true,
       }
     })

     for (const message of messages) {
       // Strategy A: Each message = new scene
       const scene = await targetDb.scene.create({
         data: {
           name: `Turn ${message.order}`,
           chapterId: mappedChapterId,
           sortOrder: message.order,
           storyTime: message.node?.storyTime,
         }
       })

       const paragraph = await targetDb.paragraph.create({
         data: {
           sceneId: scene.id,
           sortOrder: 0,
         }
       })

       // Base revision from original message
       const revision = await targetDb.paragraphRevision.create({
         data: {
           paragraphId: paragraph.id,
           body: message.content,
           version: 1,

           // Story Project AI metadata
           role: message.role,
           model: message.model,
           tokensPerSecond: message.tokensPerSecond,
           totalTokens: message.totalTokens,
           promptTokens: message.promptTokens,
           cacheCreationTokens: message.cacheCreationTokens,
           cacheReadTokens: message.cacheReadTokens,
           think: message.think,
           showThink: message.showThink,
           instruction: message.instruction,
           script: message.script,
         }
       })

       // Migrate versions
       for (const [idx, version] of message.versions.entries()) {
         await targetDb.paragraphRevision.create({
           data: {
             paragraphId: paragraph.id,
             body: version.content,
             version: idx + 2, // Start at 2 since original is 1
             instruction: version.instruction,
             model: version.model,
           }
         })
       }

       // Migrate embeddings
       for (const embedding of message.paragraphEmbeddings) {
         await targetDb.paragraphEmbedding.create({
           data: {
             paragraphRevisionId: revision.id,
             paragraphIndex: embedding.paragraphIndex,
             content: embedding.content,
             embedding: embedding.embedding,
             model: embedding.model,
             dimension: embedding.dimension,
           }
         })
       }
     }
   }
   ```

2. **Node hierarchy → Book/Arc/Chapter**
   ```typescript
   async function migrateNodes(storyId: string) {
     const nodes = await storyDb.node.findMany({
       where: { storyId },
       orderBy: [{ parentId: 'asc' }, { order: 'asc' }]
     })

     for (const node of nodes) {
       switch (node.type) {
         case 'book':
           await targetDb.book.create({
             data: {
               id: node.id,
               storyId,
               name: node.title,
               summary: node.summary,
               sortOrder: node.order,
               nodeType: 'story', // or map from node metadata
             }
           })
           break

         case 'arc':
           await targetDb.arc.create({
             data: {
               id: node.id,
               bookId: node.parentId,
               name: node.title,
               summary: node.summary,
               sortOrder: node.order,
             }
           })
           break

         case 'chapter':
           await targetDb.chapter.create({
             data: {
               id: node.id,
               arcId: node.parentId,
               name: node.title,
               summary: node.summary,
               sortOrder: node.order,
             }
           })
           break
       }
     }
   }
   ```

3. **Character migration**
   ```typescript
   async function migrateCharacters(storyId: string) {
     const characters = await storyDb.character.findMany({
       where: { storyId }
     })

     for (const char of characters) {
       await targetDb.character.create({
         data: {
           id: char.id,
           storyId,
           firstName: char.name.split(' ')[0] || char.name,
           lastName: char.name.split(' ').slice(1).join(' ') || null,
           summary: char.description,
           isMainCharacter: char.isProtagonist,
           birthdate: char.birthdate, // Timeline support!
           // ... map other fields
         }
       })
     }
   }
   ```

4. **Calendar, Map, Fleet → Direct copy**
   ```typescript
   // These have same structure, just copy
   await migrateCalendars(storyId)
   await migrateMaps(storyId)
   await migrateLandmarks(storyId)
   await migrateFleets(storyId)
   await migrateHyperlanes(storyId)
   ```

5. **ContextItem → Direct copy** (Story Project model wins)
   ```typescript
   async function migrateContextItems(storyId: string) {
     const items = await storyDb.contextItem.findMany({
       where: { storyId }
     })

     for (const item of items) {
       await targetDb.contextItem.create({
         data: {
           id: item.id,
           storyId,
           type: item.type, // 'theme' | 'location' | 'plot' | 'custom'
           name: item.name,
           description: item.description,
           isGlobal: item.isGlobal,
         }
       })
     }
   }
   ```

6. **Writer2 Location/PlotPoint → ContextItem**
   ```typescript
   async function migrateWriter2Entities(storyId: string) {
     // Convert Locations
     const locations = await writer2Db.location.findMany({
       where: { storyId }
     })
     for (const location of locations) {
       await targetDb.contextItem.create({
         data: {
           id: location.id,
           storyId,
           type: 'location',
           name: location.name,
           description: location.description || '',
           isGlobal: false,
         }
       })
     }

     // Convert PlotPoints
     const plotPoints = await writer2Db.plotPoint.findMany({
       where: { storyId }
     })
     for (const plotPoint of plotPoints) {
       await targetDb.contextItem.create({
         data: {
           id: plotPoint.id,
           storyId,
           type: 'plot',
           name: plotPoint.title,
           description: plotPoint.summary || '',
           isGlobal: false,
         }
       })
     }
   }
   ```

### Phase 4: Frontend Migration

1. **Port Story Project UI/workflow** (you prefer it)
2. **Update to use OpenAPI-generated client**
3. **Add Tauri wrapper** for desktop app
4. **Test all workflows**

### Phase 5: Cleanup

1. **Verify data integrity**
2. **Run parallel for a while** (both old + new)
3. **Archive old systems** when confident
4. **Decommission** Writer2 Server + Story Project backends

## Decisions Made

### 1. Message → Scene granularity ✅

**Decision:** Each Message = 1 Scene (1:1 migration)
- Simple, preserves exact history
- Can merge/reorganize scenes later from UI
- Clean migration path

### 2. ContextItem handling ✅

**Decision:** Adopt Story Project's ContextItem model
- Already supports everything we need
- Replaces Writer2's separate Location/PlotPoint tables
- Story Project already uses it successfully

**Schema change needed:**
- Remove separate `Location` and `PlotPoint` tables
- Use unified `ContextItem` with type discrimination
- Types: 'theme' | 'location' | 'plot' | 'custom'

### 3. Chapter.activeCharacterIds ✅

**Decision:** Keep activeCharacterIds JSON field on Chapter
- Very useful feature from Story Project
- Add to Writer2's Chapter model
- JSON array of character IDs active in that chapter

### 4. Branch choices ✅

**Decision:** Keep branching feature
- Add `branchChoices` JSON field to Story model
- Story UI already supports it
- No extra cost since we're using Story's UI base

## Next Steps

### Ready to Execute ✅

All major decisions made. Implementation order:

1. **Write complete unified Prisma schema** file
   - PostgreSQL datasource
   - All Writer2 models (enhanced)
   - All Story Project models (Calendar, Map, Fleet, etc.)
   - ContextItem (replaces Location + PlotPoint)
   - Enhanced ParagraphRevision with AI metadata
   - Chapter with activeCharacterIds/activeContextItemIds
   - Story with branchChoices

2. **Reorganize monorepo structure:**
   ```
   writer2/
   ├── apps/
   │   ├── writer/          # Existing: Desktop app (keep for now)
   │   ├── reader/          # Existing: Reader app (keep for now)
   │   ├── server/          # Existing: Writer2 backend (keep for now)
   │   ├── story/           # NEW: Copy from /home/bart/Projects/story/src
   │   │   ├── src/         # Story's React UI
   │   │   └── package.json
   │   ├── story-backend/   # NEW: Copy from /home/bart/Projects/story/backend
   │   │   ├── prisma/      # Story's SQLite schema
   │   │   ├── src/         # Story's backend code
   │   │   └── package.json
   │   └── unified-backend/ # NEW: Unified Fastify + Prisma + PostgreSQL
   │       ├── prisma/
   │       │   └── schema.prisma  # Complete unified schema
   │       ├── src/
   │       │   ├── routes/        # OpenAPI endpoints
   │       │   ├── index.ts       # Fastify server
   │       │   └── migrations/    # Migration scripts
   │       └── package.json
   ├── packages/
   │   └── shared/          # Existing: Shared types (enhance for unified)
   └── pnpm-workspace.yaml
   ```

   **Why this structure:**
   - Everything in one monorepo (easier development)
   - Story frontend + backend separated (cleaner)
   - Story backend keeps running during migration
   - New unified-backend package (clean separation)
   - Old apps kept running during migration
   - Shared types package for all apps

3. **Write unified schema:**
   - `apps/unified-backend/prisma/schema.prisma`
   - PostgreSQL datasource
   - All models from Writer2 + Story Project

4. **Set up Fastify backend:**
   - `apps/unified-backend/src/index.ts`
   - OpenAPI route definitions
   - Prisma client integration
   - Type-safe API contracts

5. **Write migration scripts:**
   - `apps/unified-backend/src/migrations/migrate-writer2.ts`
   - `apps/unified-backend/src/migrations/migrate-story.ts`
   - Users, Stories, hierarchy, Characters, ContextItems, etc.

6. **Adapt Story UI to unified backend:**
   - Story UI copied to `apps/story/src`
   - Update API client to point to unified-backend
   - Test all workflows

7. **Test migrations:**
   - Run on copies of real databases
   - Validate data integrity
   - Verify all features work

8. **Parallel run:**
   ```bash
   # Old systems (keep running)
   pnpm --filter @writer/server dev       # Writer2 backend
   pnpm --filter @writer/writer dev       # Writer desktop
   pnpm --filter story-backend dev        # Story backend
   pnpm --filter story dev                # Story frontend

   # New system
   pnpm --filter unified-backend dev      # New unified backend
   pnpm --filter story dev                # Story UI → unified backend (update config)
   ```

9. **Gradual cutover:**
   - Migrate test stories first
   - Verify features work
   - Migrate production data
   - Sunset old backends

## Files to Create

1. **Copy Story project:**
   ```bash
   # Copy Story frontend
   cp -r /home/bart/Projects/story/src apps/story
   cp /home/bart/Projects/story/package.json apps/story/
   cp /home/bart/Projects/story/vite.config.ts apps/story/
   cp /home/bart/Projects/story/tsconfig.json apps/story/

   # Copy Story backend
   cp -r /home/bart/Projects/story/backend apps/story-backend
   ```

2. **Create unified-backend package:**
   ```bash
   mkdir -p apps/unified-backend
   cd apps/unified-backend
   pnpm init
   ```

3. **Files in unified-backend:**
   - `prisma/schema.prisma` - Complete unified schema
   - `src/index.ts` - Fastify server setup
   - `src/routes/*.ts` - OpenAPI route definitions
   - `src/migrations/migrate-writer2.ts` - Writer2 → unified
   - `src/migrations/migrate-story.ts` - Story → unified
   - `package.json` - Dependencies (fastify, @fastify/swagger, prisma, etc.)

4. **Update pnpm-workspace.yaml:**
   ```yaml
   packages:
     - 'apps/*'
     - 'packages/*'
   ```
   (Should already work, just verify story + unified-backend are included)

---

**Status:** ✅ Planning complete, ready for implementation
**Next action:** Create unified Prisma schema file
