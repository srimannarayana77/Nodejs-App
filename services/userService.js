const User = require('../model/user')
const hashPassword = require('../helpers/hash');
const OTP = require('../model/otpModel');
const nodemailer = require('nodemailer');




class UserService {
    static async createUser({ name, email, age, username, password, confirmPassword }) {
        const hashedPassword = await hashPassword(password);
        const hashedConfirmPassword = await hashPassword(confirmPassword);
        return await User.create({ name, email, age, username, password: hashedPassword , confirmPassword: hashedConfirmPassword });
    }

    static async getUserByEmail(email) {
        return await User.findOne({ email });
    }

    static async getUserByUsername(username) { 
        return await User.findOne({ username });
    }

    static async  getAllUsers(filters,sortBy,sortType) {
        console.log("sortBy=",sortBy)
        console.log("sortType=",sortType)
        let sortObj = {};
        sortObj[sortBy] = sortType;
        return  await User.find()
                   .sort(sortObj );
    }

    static async getUserById(userId) {
        try {
            return await User.findById(userId);
        } catch (error) {
            throw new Error('Error retrieving user:', error);  
        } 
    } 

    static async updateUserById(userId, updateData) {
        try {
            const { name, email, age, username, password, confirmPassword } = updateData;
    
            if (!name || !email || !age || !username || !password || !confirmPassword) {
                throw new Error('All fields are required');
            }
    
            if (password !== confirmPassword) {
                throw new Error('Password and Confirm Password do not match');
            }
    
            const hashedPassword = await hashPassword(password);
            const hashedConfirmPassword = await hashPassword(confirmPassword);
    
            const updateObject = { name, email, age, username, password: hashedPassword, confirmPassword: hashedConfirmPassword };
    
            return await User.findByIdAndUpdate(userId, updateObject, { new: true });
        } catch (error) {
            throw new Error('Error updating user:', error);
        }
    }

    static async deleteUserById(userId) {
        try {
            return await User.findByIdAndDelete(userId);
        } catch (error) {
            throw new Error('Error deleting user:', error);
        }
    }

    static async signIn(email, username, password) {
        try {
            let authUser;

            if (email) {
                authUser = await User.findOne({ email });
            } else if (username) {
                authUser = await User.findOne({ username });
            }
            
            return authUser;
        } catch (error) {
            throw new Error('Error signing in:', error);
        }
    }
    static async generateOTP(email) {
        try {
            const forgetUser = await User.findOne({ email });
            if (!forgetUser) {
                throw new Error('User not found');
            }

            const otp = Math.floor(100000 + Math.random() * 900000);
            console.log("otp=", otp);
            const otpData = new OTP({ otp, email: forgetUser.email, username: forgetUser.username });
            console.log("otpdata=", otpData);
            await otpData.save();

            return otp;
        } catch (error) {
            throw new Error('Error generating OTP:', error);
        }
    }

    static async sendOTP(email, otp) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'sriman793@gmail.com',
                    pass: 'ceqk egqz moiv vmxv'
                }
            });

            const mailOptions = {
                from: 'sriman793@gmail.com',
                to: email,
                subject: 'Password Reset OTP',
                text: `Your OTP for reset password is: ${otp}`
            };

            await transporter.sendMail(mailOptions);
        } catch (error) {
            throw new Error('Error sending OTP:', error);
        }
    }

    static async verifyOTP(otp, email) {
        try {
            if (!otp || !email) {
                throw new Error("OTP and email are required");
            }

            const user = await User.findOne({ email });
            if (!user) {
                throw new Error("User not found");
            }

            const storedOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
            if (!storedOtp) {
                throw new Error("OTP not found");
            }

            if (storedOtp.otp !== otp) {
                throw new Error("Invalid OTP");
            }

            storedOtp.isVerified = true;
            await storedOtp.save();

            return { message: "OTP verified successfully" };
        } catch (error) {
            throw new Error("Error verifying OTP: " + error.message);
        }
    }
    
    static async resetPassword(email, password, confirmPassword) {
        try {
            if (!email) {
                throw new Error("Email is required");
            }

            const user = await User.findOne({ email });
            if (!user) {
                throw new Error("User not found");
            }

            const storedOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
            if (!storedOtp || !storedOtp.isVerified) {
                throw new Error("Email is not verified");
            }

            if (!password || !confirmPassword) {
                throw new Error("Password and confirm password are required");
            }

            if (password !== confirmPassword) {
                throw new Error("Password and confirm password do not match");
            }

            const hashedPassword = await hashPassword(password);
            const hashedConfirmPassword = await hashPassword(confirmPassword);

            user.password = hashedPassword;
            user.confirmPassword = hashedConfirmPassword;
            await user.save();

            return { message: "Password reset successfully" };
        } catch (error) {
            throw new Error("Error resetting password: " + error.message);
        }
    }
    
}

module.exports = UserService;
