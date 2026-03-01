import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const activitySchema = z.object({
  weekStart: z.string(),
  day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  type: z.enum(['MOBILIZATION', 'TEACHING', 'PRAYER', 'SERVICE']),
  attendees: z.array(z.string()).optional(),
  absentees: z.array(z.string()).optional(),
  absenteeReasons: z.record(z.string()).optional(),
  listened: z.array(z.string()).optional(),
  notes: z.string().optional()
});

// Get activities for a week
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { week } = req.query;
    const where: any = {};

    if (week) {
      const weekStart = new Date(week as string);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      where.weekStart = {
        gte: weekStart,
        lt: weekEnd
      };
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, group: true, bg: true }
        }
      },
      orderBy: [{ weekStart: 'asc' }, { day: 'asc' }]
    });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Create activity
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = activitySchema.parse(req.body);
    data.attendees = JSON.stringify(data.attendees || []);
    data.absentees = JSON.stringify(data.absentees || []);
    data.absenteeReasons = JSON.stringify(data.absenteeReasons || {});
    data.listened = JSON.stringify(data.listened || []);
    data.weekStart = new Date(data.weekStart);
    data.createdById = req.user!.id;

    const activity = await prisma.activity.create({
      data
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create activity' });
  }
});

// Update activity
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = activitySchema.parse(req.body);
    
    const updateData: any = { ...data };
    updateData.attendees = JSON.stringify(data.attendees || []);
    updateData.absentees = JSON.stringify(data.absentees || []);
    updateData.absenteeReasons = JSON.stringify(data.absenteeReasons || {});
    updateData.listened = JSON.stringify(data.listened || []);
    updateData.weekStart = new Date(data.weekStart);

    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(activity);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update activity' });
  }
});

// Delete activity
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.activity.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete activity' });
  }
});

export default router;
