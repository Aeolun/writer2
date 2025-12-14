import { Router } from 'express';
import listEpisodesRouter from './listEpisodes';
import getEpisodeRouter from './getEpisode';
import getFrameRouter from './getFrame';
import getSegmentVideoRouter from './getSegmentVideo';

const router = Router();

router.use(listEpisodesRouter);
router.use(getEpisodeRouter);
router.use(getFrameRouter);
router.use(getSegmentVideoRouter);

export default router;