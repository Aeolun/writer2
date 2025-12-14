import { Router } from 'express'
import { getMaps } from './getMaps'
import { getMapImage } from './getMapImage'
import { getLandmarks } from './getLandmarks'
import { getHyperlanes } from './getHyperlanes'
import { getFleets } from './getFleets'
import { createMap } from './createMap'
import { updateMap } from './updateMap'
import { deleteMap } from './deleteMap'

const router = Router()

// Get all maps for a story (metadata only)
router.get('/stories/:storyId/maps', getMaps)

// Get image data for a specific map
router.get('/maps/:mapId/image', getMapImage)

// Get landmarks for a specific map
router.get('/maps/:mapId/landmarks', getLandmarks)

// Get hyperlanes for a specific map
router.get('/maps/:mapId/hyperlanes', getHyperlanes)

// Get fleets for a specific map
router.get('/maps/:mapId/fleets', getFleets)

// Create a new map
router.post('/stories/:storyId/maps', createMap)

// Update a map
router.put('/stories/:storyId/maps/:mapId', updateMap)

// Delete a map
router.delete('/stories/:storyId/maps/:mapId', deleteMap)

export default router