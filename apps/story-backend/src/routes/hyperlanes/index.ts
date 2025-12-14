import { Router } from 'express'
import { createHyperlane } from './createHyperlane'
import { updateHyperlane } from './updateHyperlane'
import { deleteHyperlane } from './deleteHyperlane'

const router = Router({ mergeParams: true })

// Hyperlane routes
router.post('/stories/:storyId/maps/:mapId/hyperlanes', createHyperlane)
router.put('/stories/:storyId/maps/:mapId/hyperlanes/:hyperlaneId', updateHyperlane)
router.delete('/stories/:storyId/maps/:mapId/hyperlanes/:hyperlaneId', deleteHyperlane)

export default router
