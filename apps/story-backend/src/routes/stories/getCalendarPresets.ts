import { Router } from 'express';
import { CALENDAR_PRESETS } from '@story/shared';

const router = Router();

// GET calendar presets
router.get('/calendar-presets', async (_req, res) => {
  try {
    // Return array of all calendar presets
    const presets = Object.values(CALENDAR_PRESETS);
    res.json(presets);
  } catch (error: any) {
    console.error('Error fetching calendar presets:', error);
    res.status(500).json({ error: 'Failed to fetch calendar presets' });
  }
});

export default router;
