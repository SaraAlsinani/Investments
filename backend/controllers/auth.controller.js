import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import crypto from 'crypto';  
dotenv.config();

import generateTokenAndSetCookie from '../utils/generateToken.js';
import User from '../models/user.model.js';

export const signup = async (req, res) => {
    try {
        const { firstname, lastname, password, confirmPassword, gender, email, phonenumber } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid Email format" });
        }

        const phoneRegex = /^[+]?[0-9]+$/;
        if (!phoneRegex.test(phonenumber)) {
            return res.status(400).json({ error: "Invalid phone number format" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Password don't match" });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const phone = await User.findOne({ phonenumber });
        if (phone) {
            return res.status(400).json({ error: 'Phone Number already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstname,
            lastname,
            password: hashedPassword,
            gender,
            email,
            phonenumber
        });

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                gender: newUser.gender,
                phonenumber: newUser.phonenumber,
                email: newUser.email
            });
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }

    } catch (error) {
        console.log("Error in signup controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid Email or password" });
        }

        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname
        });

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const apiKey = process.env.SENDINBLUE_API_KEY; 

// Check if API key exists
if (!apiKey) {
    console.error("Sendinblue API key is missing!");
    process.exit(1);
}


const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = apiKey;

const sendResetPasswordEmail = async (email, resetUrl) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { email: 'as109ssa@gmail.com' };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = 'Password Reset Request';
    sendSmtpEmail.htmlContent = `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetUrl}">Reset Password</a>`;

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;


        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Email not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');  

    
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;  // Token is valid for 1 hour
        await user.save();

        const resetUrl = `http://localhost:5000/api/auth/resetPassword?token=${resetToken}`;
        await sendResetPasswordEmail(user.email, resetUrl);

        res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Error in forgetPassword controller:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { newPassword, confirmNewPassword } = req.body;
        const token = req.query.token;  // استخراج التوكن من الرابط

        if (!token) {
            return res.status(400).json({ error: 'Reset token is required' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ error: "Passwords don't match" });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }  // تحقق من أن الرمز لم تنتهي صلاحيته
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;  // إزالة رمز إعادة التعيين بعد استخدامه
        user.resetPasswordExpires = undefined; // إزالة تاريخ انتهاء الصلاحية
        await user.save();

        res.status(200).json({ message: 'Password has been updated successfully' });
    } catch (error) {
        console.error('Error in resetPassword controller:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { firstname, lastname, password, newPassword, phonenumber, gender } = req.body;

        // تحقق من وجود المستخدم
        const user = await User.findById(req.user._id);  // استخدم _id بدلاً من id
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // التحقق من تغيير البيانات
        if (firstname) user.firstname = firstname;
        if (lastname) user.lastname = lastname;
        if (phonenumber) user.phonenumber = phonenumber;
        if (gender) user.gender = gender;

        const phoneRegex = /^[0-9]{8}$/;  
        if (phonenumber && !phoneRegex.test(phonenumber)) {
            return res.status(400).json({ error: "Invalid phone number format" });
        }

        const phone = await User.findOne({ phonenumber });
        if (phone) {
            return res.status(400).json({ error: 'Phone Number already exists' });
        }

        // إذا كانت الباسوورد القديمة غير صحيحة
        if (password && newPassword) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Old password is incorrect' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // حفظ التحديثات في قاعدة البيانات
        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                phonenumber: user.phonenumber,
                gender: user.gender,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error in updateProfile controller:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

















// export const updateProfile = async (req, res) => {
//     try {
//         const { firstname, lastname, password, newPassword, phonenumber, gender } = req.body;

//         // تحقق من وجود المستخدم
//         const user = await User.findById(req.user.id); 
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

    
//         if (firstname) user.firstname = firstname;
//         if (lastname) user.lastname = lastname;
//         if (phonenumber) user.phonenumber = phonenumber;
//         if (gender) user.gender = gender;

//         const phone = await User.findOne({ phonenumber });
//         if (phone) {
//             return res.status(400).json({ error: 'Phone Number already exists' });
//         }
//         const phoneRegex = /^[+]?[0-9]+$/;
//         if (!phoneRegex.test(phonenumber)) {
//             return res.status(400).json({ error: "Invalid phone number format" });
//         }
//         // إذا كانت كلمة المرور القديمة موجودة و جديدة
//         if (password && newPassword) {
//             const isMatch = await bcrypt.compare(password, user.password);
//             if (!isMatch) {
//                 return res.status(400).json({ error: 'Old password is incorrect' });
//             }

//             const salt = await bcrypt.genSalt(10);
//             user.password = await bcrypt.hash(newPassword, salt);
//         }

//         // حفظ التحديثات في قاعدة البيانات
//         await user.save();

//         res.status(200).json({
//             message: 'Profile updated successfully',
//             user: {
//                 _id: user._id,
//                 firstname: user.firstname,
//                 lastname: user.lastname,
//                 phonenumber: user.phonenumber,
//                 gender: user.gender,
//                 email: user.email
//             }
//         });
//     } catch (error) {
//         console.error('Error in updateProfile controller:', error.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };



export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 }); // إزالة الكوكي
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
