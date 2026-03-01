import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  role: z.enum(['PASTEUR', 'RESPONSABLE', 'BG_LEADER']).optional(),
  group: z.enum(['PUISSANCE', 'SAGESSE', 'GLOIRE']).optional(),
  bg: z.number().min(1).max(4).optional(),
  subgroup: z.enum(['LOUANGE', 'FORCE', 'FAUSSES', 'RICHESSES']).optional(),
  isActive: z.boolean().optional()
});

// Get all users (filtered by role)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { role, group } = req.query;
    const where: any = {};

    if (role) where.role = role;
    if (group) where.group = group;
    
    // Non-Pasteur can only see users from their group
    if (req.user?.role !== 'PASTEUR' && req.user?.group) {
      where.group = req.user.group;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        group: true,
        bg: true,
        subgroup: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        group: true,
        bg: true,
        subgroup: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user
router.post('/', authenticate, authorize('PASTEUR'), async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.create({
      data
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = updateUserSchema.parse(req.body);

    // Users can only update themselves, unless they're Pasteur
    if (req.user?.role !== 'PASTEUR' && req.user?.id !== req.params.id) {
      return res.status(403).json({ error: 'Cannot update other users' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data
    });

    res.json({
      id: user.id,
      name: user.name,
      role: user.role,
      group: user.group,
      bg: user.bg
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', authenticate, authorize('PASTEUR'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete user' });
  }
});

export default router;
