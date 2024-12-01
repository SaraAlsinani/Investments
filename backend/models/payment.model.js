import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, required: true },
  tranRef: { type: String, required: true },  // حقل جديد لحفظ tran_ref
  paymentAmount: { type: Number },
  paymentCurrency: { type: String }
});


const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;


