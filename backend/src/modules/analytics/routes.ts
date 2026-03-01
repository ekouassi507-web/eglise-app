import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Overview analytics
router.get('/overview', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const totalMembers = await prisma.member.count({ where: { isActive: true } });
    
    const recentActivities = await prisma.activity.findMany({
      where: {
        weekStart: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
    
    const recentReports = await prisma.weeklyReport.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
    
    // Attendance by day
    const attendanceByDay = await prisma.activity.groupBy({
      by: ['day'],
      _count: true
    });
    
    res.json({
      totalMembers,
      recentActivities: recentActivities.length,
      recentReports,
      attendanceByDay,
      lastUpdated: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Group analytics
router.get('/group/:groupName', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { groupName } = req.params;
    
    const totalMembers = await prisma.member.count({ 
      where: { group: groupName as any, isActive: true } 
    });
    
    const reports = await prisma.weeklyReport.findMany({
      where: {
        berger: { group: groupName as any }
      },
      orderBy: { weekStart: 'desc' },
      take: 4
    });
    
    // Calculate average attendance
    const avgAttendance = reports.length > 0 
      ? reports.reduce((acc, r) => acc + r.sundayCount, 0) / reports.length 
      : 0;
    
    res.json({
      group: groupName,
      totalMembers,
      recentReports: reports.length,
      averageAttendance: Math.round(avgAttendance),
      reports
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch group analytics' });
  }
});

// Evolution analytics
router.get('/evolution', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const reports = await prisma.weeklyReport.findMany({
        where: {
          weekStart: {
            gte: weekStart,
            lt: weekEnd
          }
        }
      });
      
      weeks.push({
        week: weekStart.toISOString().split('T')[0],
        reportsCount: reports.length,
        totalAttendance: reports.reduce((acc, r) => acc + r.sundayCount, 0)
      });
    }
    
    res.json(weeks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch evolution' });
  }
});

export default router;
