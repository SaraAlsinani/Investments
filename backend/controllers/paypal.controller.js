import SubService from "../models/subService.model.js";  
import User from "../models/user.model.js";       
import Payment from "../models/payment.model.js";  
import axios from "axios";

export const processPayment = async (req, res) => {
    const userId = req.user._id;  
    const PAYTABS_API_URL = 'https://secure-oman.paytabs.com/payment/request'; 
    const secretKey = process.env.PAYTABS_SERVER_KEY;

    try {
       
        const pricingList = await SubService.find({ userId });
        if (!pricingList || pricingList.length === 0) {
            return res.status(404).json({ error: "No services found for this user" });
        }

        
        const totalAmount = pricingList.reduce((sum, service) => sum + service.price, 0);

    
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        console.log(response.data);
       
        const paymentData = {
            "profile_id": "156651",  
            "tran_type": "sale",      
            "tran_class": "ecom",  
            "cart_description": `Payment for services: ${pricingList.map(service => service.name).join(', ')}`,  // وصف الخدمات المستخرجة
            "cart_id": Date.now().toString(),  
            "cart_currency": "OMR",   
            "cart_amount": totalAmount,    
            "callback": "https://e94e-37-40-228-146.ngrok-free.app/api/payment/payment-status",  // رابط العودة بعد الدفع
            "return": "https://e94e-37-40-228-146.ngrok-free.app/api/payment/payment-status",  // رابط إعادة التوجيه بعد الدفع
            "user_id": userId 
        };

  
        const response = await axios.post(PAYTABS_API_URL, paymentData, {
            headers: {
                "Authorization": `Bearer ${secretKey}`  
            }
        });

        if (response.data && response.data.redirect_url) {
            const paymentUrl = response.data.redirect_url;

           
            const payment = new Payment({
                userId: user._id,
                amount: totalAmount,
                paymentStatus: 'Pending',
                tranRef: response.data.tran_ref || '', 
            });

            console.log(payment); 
            await payment.save();

            return res.status(200).json({ paymentUrl });
        } else {
            return res.status(400).json({ error: "Payment creation failed", message: "No redirect URL received" });
        }
        
    } catch (error) {
        return res.status(500).json({ error: "Server error", message: error.message });
    }
};

export const paymentStatus = async (req, res) => {
    const { order_id, status, amount, currency, tran_ref } = req.query;  

    try {
        if (!order_id || !status || !tran_ref) {  
            return res.status(400).json({ error: "Missing required parameters from PayTabs" });
        }

        const payment = await Payment.findOne({ tranRef: tran_ref }); 
        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

       
        if (status === "success") {
            payment.paymentStatus = "Completed";  
        } else if (status === "failed") {
            payment.paymentStatus = "Failed"; 
        } else {
            return res.status(400).json({ error: "Invalid payment status" });
        }

       
        payment.paymentAmount = amount;
        payment.paymentCurrency = currency;

        await payment.save();

        return res.status(200).json({ message: "Payment status updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Server error", message: error.message });
    }
};




















// import SubService from "../models/subService.model.js";  
// import User from "../models/user.model.js";       
// import Payment from "../models/payment.model.js";  
// import axios from "axios";

// export const processPayment = async (req, res) => {
//     const userId = req.user._id;  

//     const PAYTABS_API_URL = 'https://secure-oman.paytabs.com/payment/link/156651/6258612';
//     const secretKey = process.env.PAYTABS_SERVER_KEY;

//     try {
        
//         const pricingList = await SubService.find({ userId });
//         if (!pricingList || pricingList.length === 0) {
//             return res.status(404).json({ error: "No services found for this user" });
//         }

//         const totalAmount = pricingList.reduce((sum, service) => sum + service.price, 0);

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         const paymentData = {
//             "merchant_email": "as109ssa@gmail.com", 
//             "secret_key": secretKey,
//             "transaction_url": "https://secure.paytabs.com/payment/request",  
//             "amount": totalAmount,                   
//             "currency": pricingList[0].currency,   
//             "order_id": Date.now(),
//             "title": "Payment for Multiple Services",
//         };

      
//         const response = await axios.post(PAYTABS_API_URL, paymentData);

       
//         if (response.data && response.data.includes('URL=')) {
//             const match = response.data.match(/URL='(https:\/\/[^']+)'/);
//             if (match && match[1]) {
               
//                 const payment = new Payment({
//                     userId: user._id, 
//                     amount: totalAmount,

//                     paymentStatus: 'Pending', 
//                     transactionId: response.data.transaction_id, 
//                 });
//                 await payment.save();

           
//                 return res.status(200).json({ paymentUrl: match[1] });
//             } else {
//                 return res.status(400).json({ error: "Payment failed", message: "Redirect URL not found" });
//             }
//         } else {
//             return res.status(400).json({ error: "Payment failed", message: "No redirect URL received" });
//         }
//     } catch (error) {
//         return res.status(500).json({ error: "Server error", message: error.message });
//     }
// };

// export const paymentStatus = async (req, res) => {
//     const { order_id, status, amount, currency } = req.query;  

//     try {
//         if (!order_id || !status) {
//             return res.status(400).json({ error: "Missing required parameters from PayTabs" });
//         }

    
//         const payment = await Payment.findOne({ orderId: order_id });  
//         if (!payment) {
//             return res.status(404).json({ error: "Payment not found" });
//         }

        
//         if (status === "success") {
//             payment.paymentStatus = "Completed";  
//         } else if (status === "failed") {
//             payment.paymentStatus = "Failed";  
//         } else {
//             return res.status(400).json({ error: "Invalid payment status" });
//         }

        
//         payment.paymentAmount = amount;
//         payment.paymentCurrency = currency;

        
//         await payment.save();
//         console.log("PayTabs response data:", response.data);


//         return res.status(200).json({ message: "Payment status updated successfully" });
//     } catch (error) {
//         return res.status(500).json({ error: "Server error", message: error.message });
//     }
// };
