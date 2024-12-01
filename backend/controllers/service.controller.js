import Service from '../models/service.model.js';


export const addService = async (req, res) => {
  try {
    const { description, category, update_at } = req.body;

    // التحقق من وجود الحقول الأساسية
    if (!description || !category || !update_at) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // بدلاً من استخراج userId من التوكن، نستخدمه مباشرة من `req.user`
    const userId = req.user._id;  // الوصول إلى `userId` من الـ `user` الذي أضفته في الـ middleware

    const newService = new Service({
      description,
      category,
      update_at: new Date(update_at),
      userId, // تخزين userId مع الخدمة
    });

    await newService.save(); // حفظ الخدمة في قاعدة البيانات
    res.status(201).json({
      message: "Service added successfully",
      service: newService
    });
  } catch (error) {
    console.error("Error adding service:", error);
    res.status(500).json({ message: "Error adding service" });
  }
};
export const getServicesByUser = async (req, res) => {
    try {
      // نستخدم `userId` من الـ middleware الذي يتم إضافته إلى `req.user`
      const userId = req.user._id;
  
      // جلب الخدمات المرتبطة بـ `userId`
      const services = await Service.find({ userId }); // استعلام لاسترجاع الخدمات للمستخدم المحدد
      res.status(200).json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Error fetching services" });
    }
  };
  

// // الحصول على جميع الخدمات الأساسية
// export const getServices = async (req, res) => {
//   try {
//     const services = await Service.find();
//     res.status(200).json(services);
//   } catch (error) {
//     console.error("Error fetching services:", error);
//     res.status(500).json({ message: "Error fetching services" });
//   }
// };


// // تحديث حالة خدمة
// export const updateServiceStatus = async (req, res) => {
//     try {
//       const { serviceId, status } = req.body;
  
   
//       if (!status || !["Under Processing", "Completed", "Pending"].includes(status)) {
//         return res.status(400).json({ message: "Invalid status" });
//       }
  
      
//       const userRole = req.user.role;  
  
//       if (userRole !== 'admin' && userRole !== 'employee') {
//         return res.status(403).json({ message: "Unauthorized to update service status" });
//       }
  
//       const updatedService = await Service.findByIdAndUpdate(
//         serviceId,
//         { status },
//         { new: true }
//       );
  
//       if (!updatedService) {
//         return res.status(404).json({ message: "Service not found" });
//       }
  
//       res.status(200).json(updatedService);
//     } catch (error) {
//       console.error("Error updating service status:", error);
//       res.status(500).json({ message: "Error updating service status" });
//     }
//   };
  