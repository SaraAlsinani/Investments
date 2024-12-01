import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedSubService from "../models/seed.model.js";

dotenv.config();

mongoose.connect(process.env.MONGO_DB_URI)
  .then(() => {
    console.log("Database connected successfully!");

    // حذف البيانات السابقة
    seedSubService.deleteMany({ isSeeded: true })
      .then(() => {
        console.log("Previous seeded data deleted successfully!");

        const services = [
          { subServiceName: "Social Media Marketing", price: 200, duration: 5, category: "Marketing", isSeeded: true },
          { subServiceName: "SEO Optimization", price: 500, duration: 10, category: "Marketing", isSeeded: true },
          { subServiceName: "Email Campaign Management", price: 350, duration: 8, category: "Marketing", isSeeded: true },
          { subServiceName: "Financial Consulting", price: 1000, duration: 20, category: "Financial", isSeeded: true },
          { subServiceName: "Tax Advisory", price: 800, duration: 15, category: "Financial", isSeeded: true },
          { subServiceName: "Investment Planning", price: 1200, duration: 30, category: "Financial", isSeeded: true },
          { subServiceName: "Network Setup", price: 1500, duration: 15, category: "IT", isSeeded: true },
          { subServiceName: "Cloud Migration", price: 2000, duration: 25, category: "IT", isSeeded: true },
          { subServiceName: "Cybersecurity Assessment", price: 1800, duration: 20, category: "IT", isSeeded: true },
        ];

        // إضافة البيانات الجديدة بعد حذف القديمة
        seedSubService.insertMany(services)
          .then(insertedServices => {
            console.log(`${insertedServices.length} new services added.`);
          })
          .catch(error => {
            console.error("Error seeding sub-services:", error);
          });

      })
      .catch(error => {
        console.error("Error deleting previous seeded data:", error);
      });

  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });




// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import seedSubService from "../models/seed.model.js";

// dotenv.config();

// mongoose.connect(process.env.MONGO_DB_URI)
//   .then(() => {
//     console.log("Database connected successfully!");

//     const services = [
//         { subServiceName: "Social Media Marketing", price: 200, duration: 5, category: "Marketing", isSeeded: true },
//         { subServiceName: "SEO Optimization", price: 500, duration: 10, category: "Marketing", isSeeded: true },
//         { subServiceName: "Email Campaign Management", price: 350, duration: 8, category: "Marketing", isSeeded: true },
//         { subServiceName: "Financial Consulting", price: 1000, duration: 20, category: "Financial", isSeeded: true },
//         { subServiceName: "Tax Advisory", price: 800, duration: 15, category: "Financial", isSeeded: true },
//         { subServiceName: "Investment Planning", price: 1200, duration: 30, category: "Financial", isSeeded: true },
//         { subServiceName: "Network Setup", price: 1500, duration: 15, category: "IT", isSeeded: true },
//         { subServiceName: "Cloud Migration", price: 2000, duration: 25, category: "IT", isSeeded: true },
//         { subServiceName: "Cybersecurity Assessment", price: 1800, duration: 20, category: "IT", isSeeded: true },
//       ];

//     seedSubService.insertMany(services)
//       .then(insertedServices => {
//         console.log(`${insertedServices.length} new services added.`);
//       })
//       .catch(error => {
//         console.error("Error seeding sub-services:", error);
//       });

//   })
//   .catch((err) => {
//     console.error("Database connection error:", err);
//   });


