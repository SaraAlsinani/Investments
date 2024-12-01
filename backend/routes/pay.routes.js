import express from "express";
import { paymentStatus, processPayment } from "../controllers/paypal.controller.js";
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();
// Route لمعالجة الدفع
router.post('/pay',protectRoute,processPayment);
router.get('/payment-status', paymentStatus);


export default router;
