import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/availability', bookingController.checkAvailability);
router.get('/available-cottages', bookingController.getAvailableCottages);
router.get('/calendar', bookingController.getCalendar);

router.post('/', bookingController.createBooking);
router.post('/confirm-payment', bookingController.confirmPayment);

router.get('/my-bookings', bookingController.getUserBookings);

router.get('/all', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST'), bookingController.getAllBookings);
router.post('/:id/cancel', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST'), bookingController.cancelBooking);

export default router;
