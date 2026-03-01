import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all groups with stats
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const groups = ['PUISSANCE', 'SAGESSE', 'GLOIRE'];
    const result: any[] = [];
    
    for (const group of groups) {
      const bg1 = await prisma.member.count({ where: { group, bg: 1, isActive: true } });
      const bg2 = await prisma.member.count({ where: { group, bg: 2, isActive: true } });
      const bg3 = await prisma.member.count({ where: { group, bg: 3, isActive: true } });
      const bg4 = await prisma.member.count({ where: { group, bg: 4, isActive: true } });
      
      result.push({
        name: group,
        totalMembers: bg1 + bg2 + bg3 + bg4,
        bg: [
          { bg: 1, count: bg1 },
          { bg: 2, count: bg2 },
          { bg: 3, count: bg3 },
          { bg: 4, count: bg4 }
        ]
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
      where: { group: groupName, isActive: true },
      orderBy: [
        { bg: 'asc' },
        { name: 'asc' }
      ]
    });
    
    const membersByBG: Record<number, any[]> = {};
    members.forEach((m: any) => {
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
    const bg = parseInt(bgNumber, 10);
    
    const members = await prisma.member.findMany({
      where: { 
        group: groupName, 
        bg: bg,
        isActive: true 
      },
      orderBy: { name: 'asc' }
    });
    
    res.json({
      group: groupName,
      bg: bg,
      members,
      totalMembers: members.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BG' });
  }
});

export default router;
