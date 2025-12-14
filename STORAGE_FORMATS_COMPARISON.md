# Storage Formats Comparison & Unification Report

## Executive Summary

You currently have **three different storage formats** for story data across three systems:

1. **Writer2 Desktop App** - SQLite (Drizzle) + JSON files
2. **Writer2 Server/Reader Backend** - MySQL (Prisma)
3. **Story Project** - SQLite (Prisma) with message-based generation

This report analyzes the differences and provides recommendations for unification.

---

## 1. Writer2 Desktop App Storage

**Location:** `/home/bart/Projects/writer2/apps/writer`

### Technology Stack
- **Database:** SQLite with Drizzle ORM
- **File Storage:** JSON files (`index.json` per project)
- **State Management:** SolidJS stores
- **Sync:** Local-first with optional server sync

### Schema Structure (`apps/writer/src/db/schema.ts`)

```
story
  ├── plotpoint
  ├── character
  ├── tree (stores structure as JSON)
  ├── treeEntity (Book/Arc/Chapter/Scene hierarchy)
  └── scene (stores content as JSON)
```

### Key Characteristics
- **Minimal normalized schema** - Most data stored as JSON blobs
- **Tree-based structure** with `treeEntity` table using self-referential foreign key
- **File-based primary storage** via `index.json` containing complete story data
- **SQLite only used for querying/indexing** - source of truth is JSON file
- **Shared types** defined in `apps/shared/src/schema.ts` using Zod schemas

### Data Model Highlights
- Story → Books → Arcs → Chapters → Scenes → Paragraphs (in JSON)
- Characters, PlotPoints, Locations stored in JSON records (not tables)
- Scene content stored as `sceneJson` text field
- Very denormalized - optimized for local file I/O

---

## 2. Writer2 Server/Reader Backend Storage

**Location:** `/home/bart/Projects/writer2/apps/server`

### Technology Stack
- **Database:** MySQL with Prisma ORM
- **API:** tRPC for type-safe endpoints
- **Auth:** Session-based with Bearer tokens

### Schema Structure (`apps/server/prisma/schema.prisma`)

```
User
  └── Story
        ├── Book
        │   └── Arc
        │       └── Chapter
        │           └── Scene
        │               └── Paragraph
        │                   └── ParagraphRevision
        ├── Character
        ├── Location
        ├── PlotPoint
        ├── Item
        ├── File (images/assets)
        └── Tag (via StoryTag)
```

### Key Characteristics
- **Fully normalized relational schema**
- **Rich metadata** - created/updated timestamps, soft deletes, versioning
- **Multi-user support** with User model and ownership
- **Publishing integration** (Royal Road via ChapterPublishing)
- **File management** with SHA256 hashing, dimensions, mime types
- **Revision history** via ParagraphRevision model
- **Many-to-many relationships** (SceneCharacter, SceneReferredCharacter, StoryTag)

### Data Model Highlights
- 20+ models with full relational integrity
- Paragraph versioning with revision history
- Character/Location references per scene
- Node type classification (story/non-story/context)
- Publishing status tracking per platform
- Comprehensive user management

---

## 3. Story Project Storage

**Location:** `/home/bart/Projects/story`

### Technology Stack
- **Database:** SQLite with Prisma ORM
- **Frontend:** React (appears to be a web app)
- **Focus:** AI-assisted interactive story generation

### Schema Structure (`backend/prisma/schema.prisma`)

```
User
  └── Story
        ├── Message (core story content)
        │   ├── MessageVersion
        │   └── ParagraphEmbedding
        ├── Node (hierarchical structure)
        │   └── Book/Arc/Chapter (via type field)
        ├── Character
        ├── ContextItem
        ├── Calendar (custom calendar systems)
        ├── Map
        │   ├── Landmark
        │   ├── Fleet
        │   └── Hyperlane
        └── Chapter (legacy - being migrated to Node)
```

### Key Characteristics
- **Message-centric model** - Story is a sequence of AI-generated messages
- **Timeline/Calendar system** - Time tracking in "minutes from 0 BBY"
- **Map/Fleet system** - Spatial story visualization with movement tracking
- **Embeddings support** - RAG retrieval via ParagraphEmbedding
- **Branch choices** - Interactive story branching via `branchChoices` JSON
- **Script execution** - JavaScript execution per turn
- **LLM provider flexibility** - Supports Ollama, OpenRouter, Anthropic, OpenAI

### Data Model Highlights
- Message is primary content container (vs Paragraph in Writer2)
- Timeline system for temporal story tracking
- Map/landmark system for spatial visualization
- Calendar config stored as serialized JSON
- Node-based hierarchy (replacing legacy Chapter model)
- Character birthdate tracking in story time
- Context items (themes, locations, plot, custom)

---

## Comparison Matrix

| Feature | Writer Desktop | Writer Server | Story Project |
|---------|---------------|---------------|---------------|
| **Database** | SQLite | MySQL | SQLite |
| **ORM** | Drizzle | Prisma | Prisma |
| **Primary Storage** | JSON files | Database | Database |
| **Multi-user** | No | Yes | Yes |
| **Structure** | Book→Arc→Chapter→Scene | Book→Arc→Chapter→Scene→Paragraph | Node hierarchy + Messages |
| **Content Model** | Scene JSON blobs | Normalized Paragraphs | Message sequence |
| **Versioning** | File-based | ParagraphRevision | MessageVersion |
| **Characters** | JSON records | Full table | Table with timeline |
| **Locations** | JSON records | Full table | ContextItem |
| **Plot Points** | JSON records | Full table | ContextItem |
| **File Storage** | Local + uploaded | Database files | Database files |
| **Publishing** | Via server sync | Royal Road integration | None |
| **Timeline** | None | None | Minutes from epoch |
| **Maps** | None | None | Full spatial system |
| **Embeddings** | None | None | Vector search |
| **AI Integration** | Multi-provider | None | Multi-provider |
| **Branching** | None | None | Branch choices |
| **Calendars** | None | None | Custom calendar systems |

---

## Key Differences

### 1. Content Storage Philosophy

- **Writer Desktop:** File-first, database for indexing only
- **Writer Server:** Database-first, fully normalized
- **Story Project:** Database-first, message-based generation

### 2. Story Structure

**Writer Systems:**
```
Book → Arc → Chapter → Scene → Paragraph
```

**Story Project:**
```
Node[type=book] → Node[type=arc] → Node[type=chapter] → Messages
```

### 3. Content Granularity

- **Writer Desktop:** Scenes contain JSON array of paragraphs
- **Writer Server:** Paragraphs are first-class entities with revisions
- **Story Project:** Messages are primary content (paragraphs within)

### 4. User Model

- **Writer Desktop:** Single-user (local)
- **Writer Server:** Multi-user with sessions/access keys
- **Story Project:** Multi-user with sessions/password reset

### 5. Unique Features

**Writer Desktop Only:**
- File-based storage with `index.json`
- Tauri desktop integration
- Snowflake method planning

**Writer Server Only:**
- Royal Road publishing integration
- File SHA256 verification
- Paragraph revision history
- Multi-user bookshelf system

**Story Project Only:**
- Timeline system (BBY/ABY time tracking)
- Map/Fleet/Landmark spatial visualization
- Calendar configuration
- Message versioning & branching
- Embeddings for RAG retrieval
- Script execution per turn
- Hyperlane/Fleet movement tracking

---

## Data Migration Challenges

### 1. Structure Mapping

**Challenge:** Different hierarchy depths
- Writer uses 5 levels: Book → Arc → Chapter → Scene → Paragraph
- Story uses flexible Nodes with type discrimination

**Impact:** Converting between these requires structural transformation

### 2. Content Granularity

**Challenge:** Different content units
- Writer Desktop: Scene.paragraphs[] (JSON)
- Writer Server: Paragraph → ParagraphRevision (normalized)
- Story: Message.content with paragraph data

**Impact:** Conversion requires parsing/splitting content

### 3. Character/Location Models

**Challenge:** Different entity representations
- Writer Desktop: JSON records in story file
- Writer Server: Full relational tables with references
- Story: Characters in table, Locations as ContextItems

**Impact:** Need mapping layer for entity references

### 4. IDs and References

**Challenge:** Different ID strategies
- Writer Desktop: short-uuid (22 chars)
- Writer Server: uuid(7) from Prisma
- Story: cuid() from Prisma

**Impact:** ID collision risk when merging data

### 5. Timestamps

**Challenge:** Different time tracking
- Writer: modifiedAt numbers (Unix timestamp)
- Server: createdAt/updatedAt DateTime
- Story: savedAt, updatedAt DateTime + custom timeline

**Impact:** Need timestamp normalization

---

## Unification Strategy Recommendations

### Option 1: Converge on Writer2 Server Schema ✅ RECOMMENDED

**Rationale:** Most comprehensive, production-ready schema

**Approach:**
1. Keep Writer2 Server schema as the canonical source
2. Migrate Story Project features into Writer2 Server
3. Update Writer Desktop to sync with server schema

**Migration Steps:**

1. **Add Story Project features to Server schema:**
   ```sql
   -- Add timeline support
   ALTER TABLE Scene ADD COLUMN storyTime INT;

   -- Add message-based generation
   CREATE TABLE Message (
     id VARCHAR(22) PRIMARY KEY,
     sceneId VARCHAR(22),
     content LONGTEXT,
     ...
   );

   -- Add embeddings
   CREATE TABLE ParagraphEmbedding (
     id VARCHAR(22) PRIMARY KEY,
     paragraphRevisionId VARCHAR(22),
     embedding BLOB,
     ...
   );

   -- Add calendar support
   CREATE TABLE Calendar (...);

   -- Add map support
   CREATE TABLE Map (...);
   CREATE TABLE Landmark (...);
   CREATE TABLE Fleet (...);
   ```

2. **Update Writer Desktop:**
   - Keep JSON file format for offline-first
   - Transform to/from server schema during sync
   - Add migration script to convert old files

3. **Migrate Story Project data:**
   - Write migration script: SQLite → MySQL
   - Map Node hierarchy to Book/Arc/Chapter/Scene
   - Convert Messages to Paragraphs
   - Import Characters, ContextItems

**Pros:**
- Leverages most mature schema
- Maintains multi-user capabilities
- Preserves publishing integration
- Clear upgrade path

**Cons:**
- Requires MySQL (vs SQLite in Story)
- Most complex migration effort
- May need to deprecate some Story features

---

### Option 2: Create Unified Schema (Fresh Start)

**Approach:** Design new schema combining best of all three

**Key Design Decisions:**

1. **Content Model:**
   ```
   Story
     └── Node (flexible hierarchy)
           ├── type: 'book' | 'arc' | 'chapter' | 'scene'
           ├── nodeType: 'story' | 'non-story' | 'context'
           └── Content (polymorphic)
                 ├── Scene → Paragraph → Revision
                 └── Message (for AI generation)
   ```

2. **Database:**
   - Use **PostgreSQL** for best of both worlds:
     - JSONB for flexible data (like SQLite)
     - Full relational features (like MySQL)
     - Vector extensions for embeddings
     - Better JSON indexing

3. **Storage Strategy:**
   - Hybrid: Database primary + optional JSON export
   - Offline: Local SQLite replica
   - Sync: CRDTs for conflict resolution

**Pros:**
- Best features from all systems
- Clean slate without legacy baggage
- Future-proof architecture

**Cons:**
- Most work upfront
- Migration from all three sources
- Testing/validation burden

---

### Option 3: Keep Separate, Add Abstraction Layer

**Approach:** Keep all three systems, create unified API

**Architecture:**
```
                    Unified API Layer
                           |
         +-----------------+-----------------+
         |                 |                 |
   Writer Desktop    Writer Server    Story Project
   (SQLite/JSON)    (MySQL/Prisma)   (SQLite/Prisma)
```

**Implementation:**
- Create adapter pattern for each backend
- Common TypeScript interfaces
- Runtime format conversion
- Client chooses backend via config

**Pros:**
- No migration needed
- Preserves all unique features
- Incremental adoption

**Cons:**
- Maintenance burden (3 schemas)
- Feature parity challenges
- Performance overhead

---

## Recommended Migration Path

### Phase 1: Immediate (Unify Writer2 Desktop + Server)

**Goal:** Single source of truth for Writer2 project

1. **Standardize on server schema** for canonical data
2. **Keep desktop JSON format** for file storage
3. **Add bidirectional sync:**
   ```typescript
   // Desktop → Server
   export function syncToServer(story: PersistedStory): Promise<void>

   // Server → Desktop
   export function syncFromServer(storyId: string): Promise<PersistedStory>
   ```

4. **Write migration script:**
   ```bash
   pnpm migrate:desktop-to-server --file=path/to/index.json
   ```

### Phase 2: Short-term (Integrate Story Project Features)

**Goal:** Bring best Story Project features to Writer2

1. **Add to Writer2 Server schema:**
   - Timeline/Calendar system
   - Map/Landmark/Fleet tables
   - Embedding support
   - Message versioning

2. **Create adapters:**
   ```typescript
   // Map Story Project Node → Writer2 hierarchy
   class NodeAdapter {
     toBook(node: Node): Book
     toArc(node: Node): Arc
     toChapter(node: Node): Chapter
   }

   // Map Story Message → Writer2 Paragraph
   class MessageAdapter {
     toParagraphs(message: Message): Paragraph[]
   }
   ```

3. **Data migration:**
   ```bash
   pnpm migrate:story-to-writer2 \
     --source=/path/to/story/db.sqlite \
     --target=mysql://writer2
   ```

### Phase 3: Long-term (Convergence)

**Goal:** Single unified platform

1. **Deprecate Story Project** - redirect to Writer2
2. **Unified client** - web + desktop using same backend
3. **Feature parity** - ensure all Story features available
4. **Sunset old systems** - archive and decommission

---

## Concrete Next Steps

### If you choose Option 1 (Recommended):

1. **Audit Writer2 Server schema** - identify gaps vs Story Project
2. **Design schema additions:**
   - Timeline support
   - Map/Fleet system
   - Embeddings
   - Calendar config

3. **Create migration script:**
   ```typescript
   // apps/server/src/migrations/story-project.ts
   export async function migrateStoryProject(
     sourcePath: string,
     targetDb: PrismaClient
   ): Promise<void>
   ```

4. **Update Writer Desktop sync:**
   - Add new fields to `@writer/shared` types
   - Update sync logic
   - Test roundtrip conversion

5. **Migrate data:**
   - Export Story Project stories
   - Run migration
   - Validate data integrity
   - Decommission Story Project

### If you choose Option 2 (Fresh Start):

1. **Design unified schema** (use tools like dbdiagram.io)
2. **Choose database** (PostgreSQL recommended)
3. **Generate migrations** for all three sources
4. **Build new API** (consider GraphQL for flexibility)
5. **Update clients** to consume new API
6. **Parallel run** during transition
7. **Cutover** when confident

### If you choose Option 3 (Abstraction):

1. **Define common interfaces:**
   ```typescript
   interface StoryBackend {
     getStory(id: string): Promise<Story>
     saveStory(story: Story): Promise<void>
     listStories(): Promise<StoryMetadata[]>
   }
   ```

2. **Implement adapters:**
   - `WriterDesktopBackend implements StoryBackend`
   - `WriterServerBackend implements StoryBackend`
   - `StoryProjectBackend implements StoryBackend`

3. **Create facade:**
   ```typescript
   class UnifiedStoryService {
     constructor(private backend: StoryBackend) {}
   }
   ```

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Data loss during migration** | High | Backup all databases, test migration on copies |
| **ID conflicts** | Medium | Use namespacing (prefix: `desktop-`, `server-`, `story-`) |
| **Schema drift** | Medium | Single source of truth schema, version control |
| **Performance degradation** | Low | Index properly, profile queries |
| **Feature regression** | High | Feature parity checklist, comprehensive testing |
| **User disruption** | Medium | Phased rollout, backward compatibility |

---

## Conclusion

You have three distinct storage systems optimized for different use cases:

- **Writer Desktop:** Local-first, offline-capable
- **Writer Server:** Multi-user, publishing, production-ready
- **Story Project:** AI generation, timeline/map features

**Recommended approach:** **Option 1 - Converge on Writer2 Server**

This provides:
- ✅ Clear migration path
- ✅ Preserves production schema
- ✅ Minimal disruption
- ✅ Feature enhancement opportunity

**Next concrete action:**
Create `MIGRATION_PLAN.md` detailing Phase 1 (Desktop ↔ Server sync) with:
1. Schema mapping document
2. TypeScript migration functions
3. Test suite for data validation
4. Rollback procedures

Would you like me to draft this migration plan document?
