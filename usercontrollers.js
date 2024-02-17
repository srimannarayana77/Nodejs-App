const User = require('./models');
const OTP = require('./otpmodel')
const bcrypt = require('bcrypt');
const  hashPassword  = require('./services')
const jwt = require('jsonwebtoken')
const verifyToken  = require('./middlewares'); 
const userFilters = require('./helpers/filters');
const sortUsers = require('./helpers/sort');
const paginationResponse = require('./helpers/pagination') 


exports.SignUpUser = async (req, res) => {
    try {
        const { name, email, age, username, password, confirmPassword } = req.body;
        if (!name || !email || !age || !username || !password || !confirmPassword) {
            return res.status(422).json({ error: 'All fields are required' });
        }
        const existingEmail = await User.findOne({ email });
        const existingUsername = await User.findOne({ username });

        if (existingEmail) {
            return res.status(422).json({ error: 'Email is  already exists' });
        }

        if (existingUsername) {
            return res.status(422).json({ error: 'Username is  already exists' });
        }

        if (password !== confirmPassword) {
            return res.status(422).json({ error: 'Password and Confirm Password  does  not match' });
        }

        const hashedPassword = await hashPassword(password);
        const hashedConfirmPassword = await hashPassword(confirmPassword);
        const newUser = await User.create({ name, email, age, username, password: hashedPassword , confirmPassword:hashedConfirmPassword });
        res.status(201).json(newUser); 
    } catch (error) { 
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 
// exports.getAllUsers = async (req, res) => {
//         try {
//             const users = await User.find();
//             console.log("users=",users)
             
//             const sortBy = req.query.sortBy || 'name';
//             const sortType = req.query.sortType || 'asc'; 
    
//             const filteredUser = await userFilters(users,req.params)
//             const userSort = sortUsers(sortBy, sortType,filteredUser) 
//             const paginateUsers = paginationResponse(userSort,req)
//             res.status(200).json(paginateUsers);
//         } catch (error) {
//             console.error('Error retrieving and sorting users:', error);
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     };


exports.getUserProfile = async (req, res) => {  //getuserById change to getUserProfile
    try {
        const getUser = req.user
        console.log("getUser=",getUser)
        // const userId = req.params.id;
        const user = await User.findById(getUser.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateUserProfile = async (req, res) => {  //updateUserById change to getUserProfile
    try {
        const updateUser = req.user;
        console.log("updateUser=", updateUser); 

        const { name, email, age, username, password, confirmPassword } = req.body;

        if (!name || !email || !age || !username || !password || !confirmPassword) {
            return res.status(422).json({ error: 'All fields are required' });
        }
        
        if (password !== confirmPassword) {
            return res.status(422).json({ error: 'Password and Confirm Password do not match' });
        }

        const hashedPassword = await hashPassword(password);
        const hashedConfirmPassword = await hashPassword(confirmPassword);

        const updateObject = { name, email, age, username, password: hashedPassword, confirmPassword: hashedConfirmPassword };

        const updatedUser = await User.findByIdAndUpdate(updateUser.userId, updateObject, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



exports.deleteUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        const data = await User.findByIdAndDelete(userId);

        if (data) {
            res.status(204).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.signin  = async (req,res) => { 
    const {username,password,email} = req.body
    if((!username || !email) && !password) {
        return res.status(422).json({message : "Email or Username and password are required  Fields"})
    }if (!email && !username) {
        return res.status(422).json({message : "Email or  Username are required  Fields"})
    }
    try {
        let authUser;
        if (email) {
            authUser = await User.findOne({ email });
        } else if (username) {
            authUser = await User.findOne({ username });
        }
        
        if (!authUser) {
            return res.status(422).json({ message: "User not found" });
        }

        const matchPassword = await bcrypt.compare(password,authUser.password)
        if (!matchPassword){
            return res.status(422).json({message : "Invalid Credintials"})   
        }
        const token = jwt.sign({ userId: authUser._id, username: authUser.username }, process.env.SECRET_KEY, { expiresIn: '12h' } );
        console.log("token=",token)

        res.status(200).json({ message: 'Sign-in successful', authUser,token });
    } catch (error) {
        console.error('Error signing in:', error); 
        res.status(500).json({ error: 'Internal server error' });
    }
}

// exports.forgetPassword = async (req, res) => {
//     try {
//         const { username, email } = req.body;
//         if (!username && !email) {
//             return res.status(422).json({ message: "Username or email is required" });
//         }

//         let forgetUser;
//         if (email) {
//             forgetUser = await User.findOne({ email });
//         } else {
//             forgetUser = await User.findOne({ username });
//         }

//         if (!forgetUser) {
//             return res.status(422).json({ message: "User not found" });
//         }

//         const otp = Math.floor(100000 + Math.random() * 900000);
//         console.log("otp=",otp)
//         const otpData = new OTP({ otp, email: forgetUser.email, username: forgetUser.username });
//         console.log("otpdata=",otpData)
//         await otpData.save();

//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: 'sriman793@gmail.com',
//                 pass: 'ceqk egqz moiv vmxv'
//             }
//             });

//         const mailOptions = {
//             from: 'sriman793@gmail.com',
//             to: forgetUser.email,
//             subject: 'Password Reset OTP',
//             text: `Your OTP for reset password  is: ${otp}`
//         };

//         transporter.sendMail(mailOptions, (error, info) => {    
//             if (error) {
//                 console.error(error);
//                 return res.status(500).json({ error: "Failed to send OTP" });
//             } else {
//                 console.log('Email sent: ' + info.response);
//                 res.status(200).json({ message: "A OTP has been send to your email address" });
//             }
//         });
//         } catch (error) {
//         console.error('Error sending OTP:', error);
//         res.status(500).json({ error: 'Internal server error' });
//         }
//         };

// exports.verifyOTP = async (req, res) => {
//             try {
//                 const { otp, email, username } = req.body;
//                 console.log("otp=",otp)
//                 if (!otp || (!email && !username)) {
//                     return res.status(400).json({ error: "OTP and email/username are required" });
//                 }
//                 let user;
//                 if (email) {
//                     user = await User.findOne({ email });
//                 } else {
//                     user = await User.findOne({ username });
//                 }
        
//                 if (!user) {
//                     return res.status(404).json({ error: "User not found" });
//                 }
//                 const storedOtp = await OTP.findOne({ email: user.email, username: user.username }).sort({ createdAt: -1 });
//                 console.log("storeOtp=",storedOtp)
//                 if (!storedOtp) {
//                     return res.status(404).json({ error: "OTP not found" });
//                 }
//                 if (storedOtp.otp !== otp) {
//                     return res.status(401).json({ error: "Invalid OTP" });
//                 }
        
//                 res.status(200).json({ message: "OTP verified successfully" });
//             } catch (error) { 
//                 console.error("Error verifying OTP:", error); 
//                 res.status(500).json({ error: "Internal server error" });
//             }
//         };
        
// exports.resetPassword = async (req, res) => {
//             try {
//                 const { username, email, password, confirmPassword } = req.body;
//                 if (!username && !email) {
//                     return res.status(400).json({ error: "Username or email is required" });
//                 }
//                 let user;
//                 if (username) {
//                     user = await User.findOne({ username });
//                 } else {
//                     user = await User.findOne({ email });
//                 }
//                 if (!user) {
//                     return res.status(404).json({ error: "User not found" });
//                 }
//                 const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
//                 console.log("token=",token)
//                 jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
//                     if (err) {
//                         return res.status(401).json({ error: "Invalid or expired token" });
//                     }
//                     console.log("decodedToken:",decoded)
//                 if (!password || !confirmPassword) {
//                     return res.status(400).json({ error: "Password and confirm password are required" });
//                 }
//                 const hashedPassword = await hashPassword(password);
//                 const hashedConfirmPassword = await hashPassword(confirmPassword);
//                 if (password !== confirmPassword) {
//                     return res.status(400).json({ error: "Password and confirm password do not match" });               
//                 };
//                 user.password = hashedPassword;
//                 user.confirmPassword = hashedConfirmPassword
//                 await user.save();
//                 res.status(200).json({ message: "Password reset successfully" });
//                 });

//             }catch (error) {
//                 console.error("Error resetting password:", error); 
//                 res.status(500).json({ error: "Internal server error" });
//             }
//     };

exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(422).json({ message: "Email is required" });
        }

        const forgetUser = await User.findOne({ email });
        if (!forgetUser) {
            return res.status(422).json({ message: "User not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log("otp=", otp);
        const otpData = new OTP({ otp, email: forgetUser.email, username: forgetUser.username });
        console.log("otpdata=", otpData);
        await otpData.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sriman793@gmail.com',
                pass: 'ceqk egqz moiv vmxv'
            }
        });

        const mailOptions = {
            from: 'sriman793@gmail.com',
            to: forgetUser.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for reset password is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {    
            if (error) {
                console.error(error);
                return res.status(500).json({ error: "Failed to send OTP" });
            } else {
                res.status(200).json({ message: "An OTP has been sent to your email address" });
            }
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { otp, email } = req.body;
        console.log("otp=", otp);
        if (!otp || !email) {
            return res.status(400).json({ error: "OTP and email are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        const storedOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
        console.log("storeOtp=", storedOtp);
        if (!storedOtp) {
            return res.status(404).json({ error: "OTP not found" });
        }
        if (storedOtp.otp !== otp) {
            return res.status(401).json({ error: "Invalid OTP" });
        }
        storedOtp.isVerified = true;
        await storedOtp.save();

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) { 
        console.error("Error verifying OTP:", error); 
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.resetPassword = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const storedOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
        if (!storedOtp || !storedOtp.isVerified==true) {
            return res.status(401).json({ error: "Email is not verified" });
        }
        console.log(storedOtp.isVerified)
        if (!password || !confirmPassword) {
            return res.status(400).json({ error: "Password and confirm password are required" });
        }
        const hashedPassword = await hashPassword(password);
        const hashedConfirmPassword = await hashPassword(confirmPassword);
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Password and confirm password do not match" });
        } 
        user.password = hashedPassword;
        user.confirmPassword = hashedConfirmPassword
        await user.save();    
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error resetting password:", error); 
        res.status(500).json({ error: "Internal server error" });
    }
};
