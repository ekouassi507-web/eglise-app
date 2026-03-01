import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { z } from 'zod';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const router = Router();
const prisma = new PrismaClient();

const reportSchema = z.object({
  weekStart: z.string(),
  weekEnd: z.string(),
  personalLife: z.string().optional(),
  tuesdayMobilized: z.boolean().optional(),
  tuesdayDesignated: z.array(z.string()).optional(),
  tuesdayCount: z.number().optional(),
  wednesdayMobilized: z.boolean().optional(),
  wednesdayFromTuesday: z.boolean().optional(),
  wednesdayCount: z.number().optional(),
  fridayMobilized: z.boolean().optional(),
  fridayAllMembers: z.boolean().optional(),
  fridayCount: z.number().optional(),
  sundayMobilized: z.boolean().optional(),
  sundayAllMembers: z.boolean().optional(),
  sundayCount: z.number().optional(),
  sundayListened: z.number().optional(),
  monthlyActivities: z.string().optional(),
  prayerChains: z.string().optional(),
  qiQuotidien: z.boolean().optional(),
  qiIntermittent: z.boolean().optional(),
  bookToStudy: z.string().optional(),
  absencesNames: z.array(z.string()).optional(),
  absencesReasons: z.record(z.string()).optional(),
  supervisionTheme: z.string().optional(),
  visitedPersons: z.array(z.string()).optional(),
  visitPurpose: z.string().optional(),
  visitDate: z.string().optional(),
  visitTime: z.string().optional(),
  otherObservations: z.string().optional()
});

// Get reports
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { bergerId, week } = req.query;
    const where: any = {};

    if (bergerId) where.bergerId = bergerId;
    if (week) {
      const weekStart = new Date(week as string);
      where.weekStart = weekStart;
    }

    // Non-Pasteur can only see their own reports
    if (req.user?.role !== 'PASTEUR') {
      where.bergerId = req.user!.id;
    }

    const reports = await prisma.weeklyReport.findMany({
      where,
      include: {
        berger: {
          select: { id: true, name: true, group: true, bg: true }
        }
      },
      orderBy: { weekStart: 'desc' }
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const report = await prisma.weeklyReport.findUnique({
      where: { id: req.params.id },
      include: {
        berger: {
          select: { id: true, name: true, group: true, bg: true }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Create report
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = reportSchema.parse(req.body);
    
    const reportData: any = {
      bergerId: req.user!.id,
      weekStart: new Date(data.weekStart),
      weekEnd: new Date(data.weekEnd),
      personalLife: data.personalLife,
      tuesdayMobilized: data.tuesdayMobilized || false,
      tuesdayDesignated: JSON.stringify(data.tuesdayDesignated || []),
      tuesdayCount: data.tuesdayCount || 0,
      wednesdayMobilized: data.wednesdayMobilized || false,
      wednesdayFromTuesday: data.wednesdayFromTuesday || false,
      wednesdayCount: data.wednesdayCount || 0,
      fridayMobilized: data.fridayMobilized || false,
      fridayAllMembers: data.fridayAllMembers || false,
      fridayCount: data.fridayCount || 0,
      sundayMobilized: data.sundayMobilized || false,
      sundayAllMembers: data.sundayAllMembers || false,
      sundayCount: data.sundayCount || 0,
      sundayListened: data.sundayListened || 0,
      monthlyActivities: data.monthlyActivities,
      prayerChains: data.prayerChains,
      qiQuotidien: data.qiQuotidien || false,
      qiIntermittent: data.qiIntermittent || false,
      bookToStudy: data.bookToStudy,
      absencesNames: JSON.stringify(data.absencesNames || []),
      absencesReasons: JSON.stringify(data.absencesReasons || {}),
      supervisionTheme: data.supervisionTheme,
      visitedPersons: JSON.stringify(data.visitedPersons || []),
      visitPurpose: data.visitPurpose,
      visitDate: data.visitDate,
      visitTime: data.visitTime,
      otherObservations: data.otherObservations
    };

    const report = await prisma.weeklyReport.create({
      data: reportData
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create report' });
  }
});

// Update report (signature)
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { signature, ...data } = req.body;
    
    const updateData: any = { ...data };
    
    if (signature) {
      updateData.signature = true;
      updateData.signedAt = new Date();
      updateData.status = 'SUBMITTED';
    }

    const report = await prisma.weeklyReport.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(report);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update report' });
  }
});

// Generate PDF
router.get('/:id/pdf', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const report = await prisma.weeklyReport.findUnique({
      where: { id: req.params.id },
      include: {
        berger: true
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('RAPPORT DU BERGER', 105, 20, { align: 'center' });
    
    // Week info
    doc.setFontSize(12);
    doc.text(`Semaine du ${new Date(report.weekStart).toLocaleDateString('fr-FR')} au ${new Date(report.weekEnd).toLocaleDateString('fr-FR')}`, 105, 30, { align: 'center' });
    doc.text(`Berger: ${report.berger.name}`, 105, 38, { align: 'center' });
    
    let y = 50;
    
    // Personal life
    doc.setFontSize(14);
    doc.text('Vie Personnelle', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(report.personalLife || '-', 14, y, { maxWidth: 180 });
    
    // Work of the shepherd
    y += 20;
    doc.setFontSize(14);
    doc.text('Travail du Berger', 14, y);
    y += 8;
    doc.setFontSize(10);
    
    const workData = [
      ['Mardi', report.tuesdayMobilized ? `Oui (${report.tuesdayCount} personnes)` : 'Non'],
      ['Mercredi', report.wednesdayMobilized ? `Oui (${report.wednesdayCount} personnes)` : 'Non'],
      ['Vendredi', report.fridayMobilized ? `Oui (${report.fridayCount} personnes)` : 'Non'],
      ['Dimanche', report.sundayMobilized ? `Oui (${report.sundayCount} personnes, ${report.sundayListened} ont écouté)` : 'Non']
    ];
    
    (doc as any).autoTable({
      startY: y,
      head: [['Jour', 'Mobilisation']],
      body: workData,
      theme: 'grid',
      styles: { fontSize: 10 }
    });
    
    y = (doc as any).lastAutoTable.finalY + 15;
    
    // Church program
    doc.setFontSize(14);
    doc.text('Programme Eglise', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`QI - Quotidien: ${report.qiQuotidien ? 'Oui' : 'Non'}`, 14, y);
    y += 6;
    doc.text(`QI - Intermittent: ${report.qiIntermittent ? 'Oui' : 'Non'}`, 14, y);
    y += 6;
    doc.text(`Chaînes de prière: ${report.prayerChains || '-'}`, 14, y);
    y += 6;
    doc.text(`Livre à étudier: ${report.bookToStudy || '-'}`, 14, y);
    
    // Signature
    y += 20;
    doc.text('Signature:', 14, y);
    if (report.signature) {
      doc.text(`Signé le ${new Date(report.signedAt!).toLocaleDateString('fr-FR')}`, 14, y + 8);
    } else {
      doc.text('Non signé', 14, y + 8);
    }
    
    // Output
    const pdfBuffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rapport-berger-${report.weekStart.toISOString().split('T')[0]}.pdf`);
    res.send(Buffer.from(pdfBuffer));
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;
