// const express = require('express');
// const bodyParser = require('body-parser')
// const mongoose = require('mongoose')
// const User = require('./models') // Import the User model

// const app = express()
// const port = 3000

// // Connect to MongoDB
// mongoose.connect('mongodb+srv://sriman:1234@cluster0.rn2zrzw.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         console.log('Connected to MongoDB');
//         // Start the Express server
//         app.listen(port, () => {
//             console.log(`Server is running on http://localhost:${port}`);
//         });
//     })
//     .catch((error) => {
//         console.error('Error connecting to MongoDB:', error)
//     })
// // create application/json parser
// let jsonParser = bodyParser.json()
// // Now you can use the User model in your routes or controllers
// app.post('/users', jsonParser,async (req, res) => {    // For example, to create a new user:
//     try {
//         const { name, email, age } = req.body;
//         const newUser = new User({ name, email, age });
//         const savedUser = await newUser.save();
//         res.status(201).json(savedUser);
//     } catch (error) {
//         console.error('Error creating user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// })

// app.get('/users/all', async (req, res) => {
//     try {
//         const users = await User.find();
//         res.status(200).json(users);
//     } catch (error) {
//         console.error('Error retrieving users:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// })

// // Define the route to get a single user by ID
// app.get('/users/:id', async (req, res) => {
//     const userId = req.params.id; // Get the user ID from the request parameters
//     try {
//         const user = await User.findById(userId); // Find the user by ID in the database
//         if (!user) { // If user is not found, return 404 Not Found
//             return res.status(404).json({ error: 'User not found' });
//         }
//         res.status(200).json(user); // Send the user as a JSON response
//     } catch (error) {
//         console.error('Error retrieving user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Define the route to update a single user by ID
// app.put('/users/:id/update', jsonParser, async (req, res) => {
//     try {
//         const userId = req.params.id;
//         const { name, email, age } = req.body;

//         // Use findByIdAndUpdate method to find and update the user details
//         const updatedUser = await User.findByIdAndUpdate(userId, { name, email, age }, { new: true });

//         // Check if the user exists
//         if (!updatedUser) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // If the user is updated successfully, send the updated user details in the response
//         res.status(200).json(updatedUser);
//     } catch (error) {
//         console.error('Error updating user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// })

// // Define the route to delete a single user by ID
// app.delete('/users/:id/delete', async (req, res) => {
//     try {
//         const userId = req.params.id;
        
//         // Use the findByIdAndDelete method to find and delete the document by its ID
//         const data = await User.findByIdAndDelete(userId);

//         if (data) {
//             // If a document was found and deleted, respond with a 204 No Content status
//             res.status(204).json({ message: 'User deleted successfully and No content to display' });
//         } else {
//             // If no document was found with the provided ID, respond with a 404 Not Found status
//             res.status(404).json({ message: 'User not found.' });
//         }
//     } catch (error) {
//         console.error('Error deleting user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });




// // // Connect to MongoDB
// // mongoose.connect('mongodb+srv://sriman:1234@cluster0.rn2zrzw.mongodb.net/?retryWrites=true&w=majority', {
// //     useNewUrlParser: true,
// //     useUnifiedTopology: true,
// //     // useCreateIndex: true,
// // })


// // app.get('/', (req, res) => {
// //   res.send('Hello World!')
// // })

// // app.listen(port, () => {
// //   console.log(`Example app listening on port ${port}`)
// // })


// exports.signinWithUsername = async (req, res) => {
//     const { username, password } = req.body;
//     if (!username && !password) {
//         return res.status(400).json({ error: 'Both username and password are required' });
//     }

//     if (!username) {
//         return res.status(400).json({ error: 'Username is required' });
//     }
 
//     if (!password) {
//         return res.status(400).json({ error: 'Password is required' });
//     }

//     try {
//         const user = await User.findOne({ username });

//         if (!user) {
          
//             return res.status(404).json({ error: 'User not found' });
//         }

       
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             return res.status(401).json({ error: 'Invalid credintials' });
//         }
//         const username_token = jwt.sign(
//             { userId: user._id, username: user.username }, 
//             'your-secret-key',
//             { expiresIn: '6h' } 
//         );

//         res.status(200).json({ message: 'Sign-in successful', user,username_token });
//     } catch (error) {
//         console.error('Error signing in:', error);
//         res.status(500).json({ error: 'Internal server error' });
    