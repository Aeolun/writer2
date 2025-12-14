import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { createLogger } from '../../lib/logger';

const log = createLogger('contextItems');

export async function deleteContextItem(req: Request, res: Response) {
  try {
    const { storyId, itemId } = req.params;

    // Delete the context item from the database
    await prisma.contextItem.delete({
      where: {
        storyId_id: {
          storyId: storyId,
          id: itemId,
        },
      },
    });

    res.json({ success: true });
  } catch (error: any) {
    const { storyId, itemId } = req.params;
    log.error({ error, storyId, itemId }, 'Error deleting context item');
    
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Context item not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete context item' });
    }
  }
}