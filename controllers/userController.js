const UserService = require('../services/userService');
const verifyToken = require('../middlewares')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const userFilters = require('../helpers/filters');
class UserController {
    static async signUpUser(req, res) {
        try {
            const { name, email, age, username, password, confirmPassword } = req.body;
            if (!name || !email || !age || !username || !password || !confirmPassword) {
                return res.status(422).json({ error: 'All fields are required' });
            }
            const existingEmail = await UserService.getUserByEmail(email);
            const existingUsername = await UserService.getUserByUsername(username);

            if (existingEmail) {
                return res.status(422).json({ error: 'Email is already exists' });
            }
 
            if (existingUsername) {
                return res.status(422).json({ error: 'Username is already exists' });
            }

            if (password !== confirmPassword) {
                return res.status(422).json({ error: 'Password and Confirm Password does not match' });
            }

            const newUser = await UserService.createUser(req.body);
            res.status(201).json(newUser);
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async getAllUsers(req, res) {
        try {

            const filters = await userFilters(req.query)
            const sortBy = req.query.sort_by || 'name';
            console.log("sortBy=",sortBy)
            const sortType = req.query.sort_type || 'desc';
            // const users = await UserService.getAllUsers(filters,sortBy,sortType); 
            let users = await UserService.getAllUsers(filters,sortBy,sortType);
            console.log("users=",users)
            // users = sortUsers(users, sortBy, sortType);
            res.status(200).json(users);
        } catch (error) {
            console.error('Error retrieving users:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }  

    static async getUserProfile(req, res) {
        try {
            const userId = req.user.userId
            const user = await UserService.getUserById(userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error('Error retrieving user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async updateUserProfile(req, res) {
        try {
            const userId = req.user.userId;
            const updatedUser = await UserService.updateUserById(userId, req.body);

            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json(updatedUser); 
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async deleteUserById(req, res) {
        try {
            const userId = req.params.id;
            const data = await UserService.deleteUserById(userId);

            if (data) {
                res.status(204).json({ message: 'User deleted successfully' });
            } else {
                res.status(404).json({ message: 'User not found.' });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async signIn(req, res) {
        try {
            const { username, email, password } = req.body;

            if ((!username && !email) || !password) {
                return res.status(422).json({ message: "Email or Username and password are required fields" });
            } else if (!email && !username) {
                return res.status(422).json({ message: "Email or Username are required fields" });
            }

            const authUser = await UserService.signIn(email, username, password);
            if (!authUser) {
                return res.status(422).json({ message: "User not found" });
            }

            const matchPassword = await bcrypt.compare(password, authUser.password);
            if (!matchPassword) {
                return res.status(422).json({ message: "Invalid Credentials" });
            }

            const token = jwt.sign({ userId: authUser._id, username: authUser.username }, process.env.SECRET_KEY, { expiresIn: '12h' });
            console.log("token=", token);

            res.status(200).json({ message: 'Sign-in successful', authUser, token });
        } catch (error) {
            console.error('Error signing in:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async forgetPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(422).json({ message: "Email is required" });
            }

            const otp = await UserService.generateOTP(email);
            await UserService.sendOTP(email, otp);

            res.status(200).json({ message: "An OTP has been sent to your email address" });
        } catch (error) {
            console.error('Error sending OTP:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    
    static async verifyOTP(req, res) {
        try {
            const { otp, email } = req.body;
            const result = await UserService.verifyOTP(otp, email);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error verifying OTP:", error);
            res.status(500).json({ error: "Internal server error" });
        }

    }

    static async resetPassword(req, res) {
        try {
            const { email, password, confirmPassword } = req.body;
            const result = await UserService.resetPassword(email, password, confirmPassword);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error resetting password:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

}

module.exports = UserController;
