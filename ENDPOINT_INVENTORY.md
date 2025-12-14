# Endpoint Inventory - Writer2 & Story Backend

Complete list of all API endpoints that need to be ported to unified-backend.

## Writer2 Server (tRPC Procedures)

### Authentication & Users
- [ ] `login` - User login with email/password
- [ ] `sessionLogin` - Session-based login
- [ ] `logout` - User logout
- [ ] `sessionSignout` - Session signout
- [ ] `register` - User registration
- [ ] `whoAmI` - Get current user info
- [ ] `userById` - Get user by ID
- [ ] `userList` - List all users (admin)
- [ ] `updatePassword` - Change user password
- [ ] `updateName` - Update user name
- [ ] `updateClientName` - Update client display name
- [ ] `updateAvatar` - Update user avatar
- [ ] `uploadUserImage` - Upload user profile image

### Stories - Core
- [ ] `uploadStory` - Upload/create story
- [ ] `downloadStory` - Download story data
- [ ] `getStory` - Get story details
- [ ] `listStories` - List all stories
- [ ] `myFiction` - Get current user's stories
- [ ] `listRandomStories` - Get random stories
- [ ] `searchStories` - Search stories by query
- [ ] `getStoryStatus` - Get story publishing status
- [ ] `publishStory` - Publish story
- [ ] `checkStoryDifferences` - Check for sync differences
- [ ] `randomizeOrder` - Randomize story order

### Stories - Chapters
- [ ] `getChapter` - Get chapter details
- [ ] `getReleases` - Get chapter releases

### Stories - Files & Images
- [ ] `uploadStoryImage` - Upload story cover image
- [ ] `downloadFiles` - Download story files
- [ ] `listUploadedFiles` - List uploaded files for story

### Bookshelf
- [ ] `getBookshelfStories` - Get user's bookshelf
- [ ] `setBookshelfState` - Add/remove from bookshelf
- [ ] `checkBookshelfState` - Check if story in bookshelf
- [ ] `updateStoryReadStatus` - Update reading progress

### Publishing (Royal Road)
- [ ] `importRoyalroad` - Import story from Royal Road
- [ ] `publishToRoyalRoad` - Publish chapter to Royal Road
- [ ] `syncRoyalRoadPublishing` - Sync publishing status

### System
- [ ] `connectedClients` - List connected WebSocket clients
- [ ] `authorList` - List all authors

---

## Story Backend (Express Routes)

### Authentication (`/auth`)
- [ ] `POST /auth/register` - User registration
- [ ] `POST /auth/login` - User login
- [ ] `POST /auth/logout` - User logout
- [ ] `GET /auth/session` - Check session status
- [ ] `POST /auth/request-password-reset` - Request password reset
- [ ] `POST /auth/reset-password` - Reset password with token

### Stories (`/stories`)
- [ ] `GET /stories` - Get all stories for user
- [ ] `POST /stories` - Create new story
- [ ] `GET /stories/:id` - Get story details
- [ ] `PUT /stories/:id` - Update story
- [ ] `DELETE /stories/:id` - Delete story
- [ ] `PUT /stories/:id/settings` - Update story settings
- [ ] `GET /stories/:id/deleted-messages` - Get soft-deleted messages
- [ ] `POST /stories/:id/restore-message` - Restore deleted message
- [ ] `POST /stories/:id/export/pdf` - Export story as PDF

### Calendars (`/stories/:id/calendars`)
- [ ] `GET /stories/:id/calendars` - Get story calendars
- [ ] `POST /stories/:id/calendars` - Create calendar
- [ ] `GET /stories/:id/calendars/:calendarId` - Get calendar details
- [ ] `PUT /stories/:id/calendars/:calendarId` - Update calendar
- [ ] `DELETE /stories/:id/calendars/:calendarId` - Delete calendar
- [ ] `PUT /stories/:id/calendars/:calendarId/set-default` - Set as default calendar
- [ ] `GET /calendars/presets` - Get calendar presets

### Nodes/Hierarchy (`/nodes`)
- [ ] `GET /nodes` - Get all nodes for story
- [ ] `POST /nodes` - Create new node (book/arc/chapter)
- [ ] `PUT /nodes/:id` - Update single node
- [ ] `PUT /nodes/bulk` - Update multiple nodes
- [ ] `DELETE /nodes/:id` - Delete node
- [ ] `POST /nodes/migrate` - Migrate from old chapter structure

### Chapters (`/chapters`)
- [ ] `GET /chapters` - Get chapters for story
- [ ] `POST /chapters` - Create chapter
- [ ] `PUT /chapters/:id` - Update chapter
- [ ] `PATCH /chapters/:id` - Update single chapter field
- [ ] `DELETE /chapters/:id` - Delete chapter
- [ ] `POST /chapters/:id/generate-summary` - Generate AI summary

### Messages/Content (`/messages`)
- [ ] `PUT /messages/:id` - Update message content
- [ ] `POST /messages/reorder` - Reorder messages
- [ ] `GET /messages/:id/versions` - Get message version history
- [ ] `POST /messages/:id/versions` - Create new message version
- [ ] `PUT /messages/:id/versions/:versionId` - Save message version
- [ ] `POST /messages/semantic-search` - Search messages by semantic similarity

### Characters (`/characters`)
- [ ] `POST /characters` - Create character
- [ ] `PUT /characters/:id` - Update character
- [ ] `DELETE /characters/:id` - Delete character

### Context Items (`/context-items`)
- [ ] `PUT /context-items/:id` - Update context item (theme/location/plot)
- [ ] `DELETE /context-items/:id` - Delete context item

### Maps (`/maps`)
- [ ] `GET /maps` - Get all maps for story
- [ ] `POST /maps` - Create map
- [ ] `PUT /maps/:id` - Update map
- [ ] `DELETE /maps/:id` - Delete map
- [ ] `GET /maps/:id/image` - Get map image
- [ ] `GET /maps/:id/landmarks` - Get landmarks for map
- [ ] `GET /maps/:id/fleets` - Get fleets for map
- [ ] `GET /maps/:id/hyperlanes` - Get hyperlanes for map

### Landmarks (`/landmarks`)
- [ ] `POST /landmarks` - Create landmark
- [ ] `PUT /landmarks/:id` - Update landmark
- [ ] `DELETE /landmarks/:id` - Delete landmark

### Landmark States (`/landmark-states`)
- [ ] `GET /landmark-states` - Get states for landmark
- [ ] `POST /landmark-states` - Set landmark state at time
- [ ] `POST /landmark-states/batch` - Batch set multiple states
- [ ] `GET /landmark-states/accumulated` - Get accumulated states at time

### Fleets (`/fleets`)
- [ ] `POST /fleets` - Create fleet
- [ ] `PUT /fleets/:id` - Update fleet
- [ ] `DELETE /fleets/:id` - Delete fleet
- [ ] `POST /fleets/:id/movements` - Create fleet movement
- [ ] `PUT /fleets/:id/movements/:movementId` - Update movement
- [ ] `DELETE /fleets/:id/movements/:movementId` - Delete movement

### Hyperlanes (`/hyperlanes`)
- [ ] `POST /hyperlanes` - Create hyperlane
- [ ] `PUT /hyperlanes/:id` - Update hyperlane
- [ ] `DELETE /hyperlanes/:id` - Delete hyperlane

### Refinement/AI Processing (`/refinement`)
- [ ] `POST /refinement/start` - Start AI refinement process
- [ ] `POST /refinement/stop` - Stop refinement
- [ ] `GET /refinement/status` - Get refinement status

### Media Attachments (Generic replacement for Episodes/Video)
- [ ] `GET /stories/:storyId/media` - List media attachments
- [ ] `POST /stories/:storyId/media` - Upload media metadata (transcript + image URLs)
- [ ] `GET /stories/:storyId/media/:id` - Get media details
- [ ] `PUT /stories/:storyId/media/:id` - Update media metadata
- [ ] `DELETE /stories/:storyId/media/:id` - Delete media attachment
- [ ] `POST /stories/:storyId/media/:id/link-scene` - Link media to scene(s)

### Health/System (`/health`)
- [ ] `GET /health` - Health check
- [ ] `POST /health/log` - Client logging endpoint

---

## Unified Backend Organization

Proposed route structure for unified-backend:

```
/auth
  POST /register
  POST /login
  POST /logout
  GET /session
  POST /request-password-reset
  POST /reset-password

/users
  GET /me
  GET /:id
  GET /list (admin)
  PUT /me/password
  PUT /me/profile
  PUT /me/avatar
  POST /me/avatar/upload

/stories
  GET /
  POST /
  GET /:id
  PUT /:id
  DELETE /:id
  PUT /:id/settings
  POST /:id/publish (Royal Road)
  GET /:id/publishing-status
  POST /:id/import-royal-road
  POST /:id/export/pdf

/stories/:storyId/books
  GET /
  POST /
  PUT /:id
  DELETE /:id

/stories/:storyId/arcs
  GET /
  POST /
  PUT /:id
  DELETE /:id

/stories/:storyId/chapters
  GET /
  POST /
  PUT /:id
  DELETE /:id
  POST /:id/publish-royal-road
  POST /:id/generate-summary

/stories/:storyId/scenes
  GET /
  POST /
  PUT /:id
  DELETE /:id

/stories/:storyId/paragraphs
  GET /
  POST /
  PUT /:id
  DELETE /:id
  GET /:id/versions
  POST /:id/versions

/stories/:storyId/characters
  GET /
  POST /
  PUT /:id
  DELETE /:id

/stories/:storyId/context-items
  GET /
  POST /
  PUT /:id
  DELETE /:id

/stories/:storyId/calendars
  GET /
  POST /
  GET /:id
  PUT /:id
  DELETE /:id
  PUT /:id/set-default
  GET /presets (global)

/stories/:storyId/maps
  GET /
  POST /
  GET /:id
  PUT /:id
  DELETE /:id
  GET /:id/image

/stories/:storyId/landmarks
  GET /
  POST /
  PUT /:id
  DELETE /:id
  GET /:id/states
  POST /:id/states
  POST /states/batch

/stories/:storyId/fleets
  GET /
  POST /
  PUT /:id
  DELETE /:id
  POST /:id/movements
  PUT /:id/movements/:movementId
  DELETE /:id/movements/:movementId

/stories/:storyId/hyperlanes
  GET /
  POST /
  PUT /:id
  DELETE /:id

/stories/:storyId/search
  POST /semantic (semantic search)

/bookshelf
  GET /
  POST /add
  DELETE /remove
  GET /:storyId/status

/files
  POST /upload
  GET /:id
  GET /list

/system
  GET /health
  GET /connected-clients (admin)
```

---

## Summary

**Total Endpoints to Port:**
- **Writer2:** ~40 tRPC procedures
- **Story:** ~90+ REST endpoints
- **Total:** ~130 endpoints

**Priority Order:**
1. ✅ Auth & Sessions (critical)
2. ✅ Stories CRUD (critical)
3. ✅ Hierarchy (Books/Arcs/Chapters/Scenes) (critical)
4. ✅ Characters & Context Items (high)
5. ✅ Paragraphs/Content (high)
6. ✅ Files & Images (high)
7. ✅ Calendars (medium)
8. ✅ Maps & Spatial features (medium)
9. ✅ Publishing (Royal Road) (medium)
10. ✅ Refinement/AI (low - can add later)
11. ✅ Media Attachments (medium - generic replacement for video)

**Estimated Work:**
- Critical (1-3): ~40 endpoints
- High (4-6): ~30 endpoints
- Medium (7-9): ~40 endpoints
- Low (10): ~10 endpoints
- Skip (11): ~10 endpoints

**That's a LOT of endpoints!** 🎯
