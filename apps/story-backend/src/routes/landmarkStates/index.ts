import { Router } from 'express'
import { getLandmarkStates } from './getLandmarkStates'
import { getAccumulatedStates } from './getAccumulatedStates'
import { setLandmarkState } from './setLandmarkState'
import { batchSetStates } from './batchSetStates'

const router = Router()

// Get all landmark states for a story (optionally filtered by messageId or mapId)
router.get('/stories/:storyId/landmark-states', getLandmarkStates)

// Get accumulated landmark states up to a specific message
router.get('/stories/:storyId/landmark-states/accumulated/:messageId', getAccumulatedStates)

// Set a single landmark state
router.post('/stories/:storyId/landmark-states', setLandmarkState)

// Batch set multiple landmark states
router.post('/stories/:storyId/landmark-states/batch', batchSetStates)

export default router