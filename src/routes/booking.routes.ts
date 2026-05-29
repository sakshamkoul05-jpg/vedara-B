import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBookingSchema, confirmPaymentSchema, cancelBookingSchema } from '../validators/booking.validator';

const router = Router();

router.get('/availability', bookingController.checkAvailability);
router.get('/available-cottages', bookingController.getAvailableCottages);
router.get('/calendar', bookingController.getCalendar);

router.post('/', validate(createBookingSchema), bookingController.createBooking);
router.post('/confirm-payment', validate(confirmPaymentSchema), bookingController.confirmPayment);

router.get('/my-bookings', bookingController.getUserBookings);

router.get('/all', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST'), bookingController.getAllBookings);
router.post('/:id/approve', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), bookingController.approveBooking);
router.post('/:id/reject', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), bookingController.rejectBooking);
router.post('/:id/cancel', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST'), validate(cancelBookingSchema), bookingController.cancelBooking);

export default router;
