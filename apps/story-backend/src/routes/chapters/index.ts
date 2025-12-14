import { Router } from 'express';
import getChapters from './getChapters';
import createChapter from './createChapter';
import updateChapter from './updateChapter';
import deleteChapter from './deleteChapter';
import generateSummary from './generateSummary';

const router = Router();

// Mount all chapter routes
router.use(getChapters);
router.use(createChapter);
router.use(updateChapter);
router.use(deleteChapter);
router.use(generateSummary);

export default router;