import { Router } from 'express';
import getAllStories from './getAllStories';
import getStory from './getStory';
import createStory from './createStory';
import updateStory from './updateStory';
import updateSettings from './updateSettings';
import deleteStory from './deleteStory';
import exportPdf from './exportPdf';
import getDeletedMessages from './getDeletedMessages';
import restoreMessage from './restoreMessage';
import getCalendar from './getCalendar';
import getCalendarPresets from './getCalendarPresets';
import createCalendar from './createCalendar';
import updateCalendar from './updateCalendar';
import deleteCalendar from './deleteCalendar';
import setDefaultCalendar from './setDefaultCalendar';

const router = Router();

// Mount all story routes
router.use(getAllStories);
router.use(getStory);
router.use(getCalendar);
router.use(getCalendarPresets);
router.use(createCalendar);
router.use(updateCalendar);
router.use(deleteCalendar);
router.use(setDefaultCalendar);
router.use(createStory);
router.use(updateStory);
router.use(updateSettings);
router.use(deleteStory);
router.use(exportPdf);
router.use(getDeletedMessages);
router.use(restoreMessage);

export default router;