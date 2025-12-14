import { Router } from 'express'
import { createLandmark } from './createLandmark'
import { updateLandmark } from './updateLandmark'
import { deleteLandmark } from './deleteLandmark'

const router = Router()

router.post('/stories/:storyId/maps/:mapId/landmarks', createLandmark)
router.put('/stories/:storyId/maps/:mapId/landmarks/:landmarkId', updateLandmark)
router.delete('/stories/:storyId/maps/:mapId/landmarks/:landmarkId', deleteLandmark)

export default router
