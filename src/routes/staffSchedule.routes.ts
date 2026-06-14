import { Router } from 'express';
import { staffScheduleService } from '../services/staffSchedule.service';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/:staffId/shifts', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const shifts = await staffScheduleService.getShifts(
      req.params.staffId, new Date(startDate as string), new Date(endDate as string)
    );
    res.json({ success: true, data: shifts });
  } catch (error) { next(error); }
});

router.post('/shifts', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const shift = await staffScheduleService.createShift(req.body);
    res.status(201).json({ success: true, data: shift });
  } catch (error) { next(error); }
});

router.post('/shifts/bulk', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const { staffId, startDate, endDate, pattern } = req.body;
    const result = await staffScheduleService.createBulkShifts(
      staffId, new Date(startDate), new Date(endDate), pattern
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.delete('/shifts/:id', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    await staffScheduleService.deleteShift(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

router.post('/:staffId/check-in', authenticate, async (req, res, next) => {
  try {
    const attendance = await staffScheduleService.checkIn(req.params.staffId);
    res.json({ success: true, data: attendance });
  } catch (error) { next(error); }
});

router.post('/:staffId/check-out', authenticate, async (req, res, next) => {
  try {
    const attendance = await staffScheduleService.checkOut(req.params.staffId);
    res.json({ success: true, data: attendance });
  } catch (error) { next(error); }
});

router.get('/:staffId/attendance', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const attendance = await staffScheduleService.getAttendance(
      req.params.staffId, new Date(startDate as string), new Date(endDate as string)
    );
    res.json({ success: true, data: attendance });
  } catch (error) { next(error); }
});

router.get('/:staffId/summary', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const summary = await staffScheduleService.getStaffScheduleSummary(req.params.staffId, month, year);
    res.json({ success: true, data: summary });
  } catch (error) { next(error); }
});

export default router;
