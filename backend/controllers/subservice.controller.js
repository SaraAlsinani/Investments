import seedSubServices from "../models/seed.model.js";
import SubService from "../models/subService.model.js";

export const getSeededSubServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }
    const subServices = await seedSubServices.find({ category, isSeeded: true });

    if (subServices.length === 0) {
      return res.status(404).json({ message: `No seeded sub-services found for category: ${category}` });
    }

    res.status(200).json({ subServices });
  } catch (error) {
    console.error("Error fetching seeded sub-services:", error);
    res.status(500).json({ message: "Error fetching seeded sub-services" });
  }
};


export const addSubService = async (req, res) => {
  try {
    const { category, subServiceName } = req.body;

    if (!category || !subServiceName) {
      return res.status(400).json({ message: "Category and SubService Name are required" });
    }

    const service = await seedSubServices.findOne({ category, subServiceName });

    if (!service) {
      return res.status(400).json({ message: "Sub-service not found for the selected category" });
    }

    // استخراج السعر والمدة من البيانات 
    const { price, duration } = service;

    const userId = req.user._id;  

    // إنشاء الخدمة الفرعية الجديدة
    const newSubService = new SubService({
      subServiceName,
      price,
      duration,
      category,
      userId
    });

    await newSubService.save();

    res.status(201).json({
      message: "Sub-service added successfully",
      subService: newSubService
    });
  } catch (error) {
    console.error("Error adding sub-service:", error);
    res.status(500).json({ message: "Error adding sub-service" });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { subServiceId, paymentMethod } = req.body;

    if (!subServiceId || !paymentMethod) {
      return res.status(400).json({ message: "SubService ID and payment method are required" });
    }

    // تحديث حالة الدفع
    const updatedSubService = await SubService.findByIdAndUpdate(
      subServiceId,
      {
        isPaid: true,
        paymentMethod,
        paymentDate: new Date(),
      },
      { new: true } // إرجاع الوثيقة بعد التحديث
    );

    if (!updatedSubService) {
      return res.status(404).json({ message: "SubService not found" });
    }

    res.status(200).json({
      message: "Payment status updated successfully",
      subService: updatedSubService,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Error updating payment status" });
  }
};
