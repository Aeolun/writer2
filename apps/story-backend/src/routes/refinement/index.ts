import { Router } from 'express';
import startRefinement from './startRefinement';
import getRefinementStatus from './getRefinementStatus';
import stopRefinement from './stopRefinement';

const router = Router();

// Mount all refinement routes
router.use(startRefinement);
router.use(getRefinementStatus);
router.use(stopRefinement);

export default router;