import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all members
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { group, search } = req.query;
    const where: any = {};

    if (group) where.group = group;
    if (search) {
      where.name = { contains: search as string };
    }

    const members = await prisma.member.findMany({
      where,
      orderBy: [
        { group: 'asc' },
        { bg: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get member by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// Create member
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, group, bg, subgroup } = req.body;

    const member = await prisma.member.create({
      data: {
        name,
        phone: phone || null,
        group,
        bg: parseInt(bg),
        subgroup: subgroup || null,
        isActive: true
      }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Create member error:', error);
    res.status(400).json({ error: 'Failed to create member' });
  }
});

// Update member
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, group, bg, subgroup, isActive } = req.body;

    const member = await prisma.member.update({
      where: { id: req.params.id },
      data: {
        name,
        phone: phone || null,
        group,
        bg: parseInt(bg),
        subgroup: subgroup || null,
        isActive
      }
    });

    res.json(member);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update member' });
  }
});

// Delete member
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.member.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete member' });
  }
});

export default router;
