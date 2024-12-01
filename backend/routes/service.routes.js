import express from "express";
import { addService } from "../controllers/service.controller.js"; 
import { addSubService, getSeededSubServicesByCategory, updatePaymentStatus } from "../controllers/subservice.controller.js"; 
import protectRoute from "../middleware/protectRoute.js";


const router = express.Router();

// إضافة خدمة جديدة
router.post("/addService", protectRoute, addService);

//البحث
router.get('/seedSubServices/:category', getSeededSubServicesByCategory);

//خدمة فرعية جديدة

router.post("/addSubService", protectRoute, addSubService);

// تحديث حالة الدفع
router.post("/updatePaymentStatus", protectRoute, updatePaymentStatus);

export default router;
