import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all groups with stats
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const groups = ['PUISSANCE', 'SAGESSE', 'GLOIRE'];
    const result = [];
    
    for (const group of groups) {
      const bgCounts = await Promise.all(
        [1, 2, 3, 4].map(bg => 
          prisma.member.count({ where: { group: group as any, bg, isActive: true })
        )
      );
      
      result.push({
        name: group,
        totalMembers: bgCounts.reduce((a, b) => a + b, 0),
        bg: bgCounts.map((count, i) => ({ bg: i + 1, count }))
      });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get group details
router.get('/:groupName', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { groupName } = req.params;
    
    const members = await prisma.member.findMany({
      where: { group: groupName as any, isActive: true },
      orderBy: [{ bg: 'asc' }, { name: 'asc' }]
    });
    
    const membersByBG = {};
    members.forEach(m => {
      if (!membersByBG[m.bg]) membersByBG[m.bg] = [];
      membersByBG[m.bg].push(m);
    });
    
    res.json({
      name: groupName,
      members,
      membersByBG,
      totalMembers: members.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Get BG details
router.get('/:groupName/bg/:bgNumber', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { groupName, bgNumber } = req.params;
    
    const members = await prisma.member.findMany({
      where: { 
        group: groupName as any, 
        bg: parseInt(bgNumber),
        isActive: true 
      },
      orderBy: { name: 'asc' }
    });
    
    res.json({
      group: groupName,
      bg: parseInt(bgNumber),
      members,
      totalMembers: members.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BG' });
  }
});

export default router;
