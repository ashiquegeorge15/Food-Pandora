const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const multer = require('multer'); 
const fs = require('fs');

const app = express();
const port = 8000;

// MongoDB connection
const mongoUri =
  'mongodb://admin:9f3f9a87f72f79bea9ba44e77293b18681aa8089e8975c59@143.110.186.103:27017/Food_Pandora?authSource=admin';
mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define User schema
const userSchema = new mongoose.Schema({
Data_User_ID: { type: Number, required: true },
Email: { type: String, required: true, unique: true },
Password: { type: String, required: true },
Name: { type: String, required: true },
Phone_Number: { type: String },
Role: { type: String, default: 'user' },
Created_At: { type: Date, default: Date.now },
Updated_At: { type: Date, default: Date.now },
ResetPasswordToken: { type: String },
ResetPasswordExpires: { type: Date },

// changes 
Date_Of_Birth: { type: Date }, // Added for Data_Users
Height: { type: Number }, // Added for Data_Users
Weight: { type: Number }, // Added for Data_Users
Types_of_eaters: { type: String }, // Added for Data_Users
Allergen: [{ type: String }], // Array of allergens, not an object
Lifestyle: { type: String }, // Added for Data_Users
Health_Profile: mongoose.Schema.Types.Mixed, // Can be any type (object or array)
Profile_Image: { type: String } // URL to the profile image
}, { collection: 'Data_Users' }); // Explicitly set collection name

// Define Data Manager Schema
const dataManagerSchema = new mongoose.Schema({
Data_Manager_ID: { type: Number, required: true },
Email: { type: String, required: true, unique: true }, // Ensure email is unique
Password: { type: String, required: true },
Name: { type: String, required: true },
Phone_Number: { type: String },
Role: { type: String, default: 'datamanager' },
Created_At: { type: Date, default: Date.now },
Updated_At: { type: Date, default: Date.now },
ResetPasswordToken: { type: String },
Date_Of_Birth: { type: Date }, // Added for Data_Manager
Height: { type: Number }, // Added for Data_Manager
Weight: { type: Number }, // Added for Data_Manager
Types_of_eaters: { type: String }, // Added for Data_Manager
Allergen: [{ type: String }], // Array of allergens, not an object
Lifestyle: { type: String }, // Added for Data_Manager
Health_Profile: mongoose.Schema.Types.Mixed, // Can be any type (object or array)
Profile_Image: { type: String } // URL to the profile image
}, { collection: 'Data_manager' }); // Explicitly set collection name

// Create User model
const User = mongoose.model('Data_User', userSchema, 'Data_Users');
const DataManager = mongoose.model('Data_Manager', dataManagerSchema, 'Data_Manager');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(cors());
app.use(express.json());
//middleware
app.use(cors());
app.use('/uploads', express.static('uploads'))



// Routes to serve HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/dailog', (req, res) => res.sendFile(path.join(__dirname, 'dailog.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));
app.get('/forgotpassword', (req, res) =>res.sendFile(path.join(__dirname, 'forgotpassword.html')));
app.get('/terms_and_conditions', (req, res) =>res.sendFile(path.join(__dirname, 'tnc.html')));
app.get('/Profile', (req, res) => res.sendFile(path.join(__dirname, 'user_prof.html')));
app.get('/dm_dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dm_dashboard.html')));
app.get('/upload_nutrition', (req, res) => res.sendFile(path.join(__dirname, 'upload_nutrition.html')));
app.get('/Data_Manager_Dashboard', (req, res) => res.sendFile(path.join(__dirname, 'Data_Manager_Dashboard.html')));
app.get('/Data_manager_recipe_recommendation', (req, res) => res.sendFile(path.join(__dirname, 'Data_manager_recipe_recommendation-1.html')));
app.get('/Data_manager_viewall', (req, res) => res.sendFile(path.join(__dirname, 'Data_manager_viewall.html')));
app.get('/Data_manager_viewall2', (req, res) => res.sendFile(path.join(__dirname, 'Data_manager_viewall-2.html')));
app.get('/SuperUser_Dashboard', (req, res) => res.sendFile(path.join(__dirname, 'Superuser_dashboard.html')));
app.get('/SuperUser_Manage_User', (req, res) => res.sendFile(path.join(__dirname, 'Superuser_manager_user.html')));
app.get('/Nutrition_Calculator', (req, res) => res.sendFile(path.join(__dirname, 'nutrition_calculator.html')));
app.get('/updateProduct', (req, res) => res.sendFile(path.join(__dirname, 'updateproduct.html')));
app.get('/Nutri-Cal', (req, res) => res.sendFile(path.join(__dirname, 'calculator.html')));


// generating user id

const generateUserId = async () => {
const userCount = await User.countDocuments();
const Data_User_ID = userCount + 1;
return Data_User_ID;
};

// generating data manager id

const generateDataManagerId = async () => {
const managerCount = await DataManager.countDocuments();
return Data_Manager_ID = managerCount + 1;
return Data_Manager_ID;
};
// Handle Registration
app.post('/register', async (req, res) => {
  const { Name, Email, Phone_Country_Code, Phone_Number, Password, Confirm_Password } =
    req.body;

  // Validation
  if (Password !== Confirm_Password) {
    return res.status(400).send('Passwords do not match');
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Generate a unique Data_User_ID by counting the number of users
    const userCount = await User.countDocuments();
    const Data_User_ID = userCount + 1;

    // Create a new user
    const newUser = new User({
      Data_User_ID,
      Name,
      Email,
      Phone_Number: `${Phone_Country_Code}${Phone_Number}`,
      Password: hashedPassword,
      Created_At: new Date(),
      Updated_At: new Date(),
    });

    // Save user to the database
    await newUser.save();
    console.log('User registered successfully:', newUser);

    // Redirect to success page after registration
    res.redirect('/dailog');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Error registering user: ' + err.message);
  }
});

// Handle register_datamanager
 
app.post('/register_datamanager', async (req, res) => {
const { Name, Email, Phone_Number, Password, Confirm_Password } = req.body;

// Validation
if (Password !== Confirm_Password) {
  return res.status(400).send('Passwords do not match');
}

try {
  // Hash the password
  const hashedPassword = await bcrypt.hash(Password, 10);
  const Data_Manager_ID = await generateDataManagerId();

  // Create a new data manager
  const newDataManager = new DataManager({
    Data_Manager_ID,
    Name,
    Email,
    Phone_Number,
    Password: hashedPassword,
    Role: 'datamanager',
    Created_At: Date.now(),
    Updated_At: Date.now()
  });

  await newDataManager.save();
  res.status(201).send('Data manager registered successfully');
} catch (error) {
  console.error('Error registering data manager:', error);
  res.status(500).send('Internal Server Error');
}
});

app.post('/login', async (req, res) => {
  const { Email, Password } = req.body;

  try {
    console.log('Login request:', { Email, Password });

    // Fetch user by email
    const user = await User.findOne({ Email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    console.log('Fetched User:', user);

    // Compare hashed password
    const isPasswordMatch = await bcrypt.compare(Password, user.Password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // Role-based redirection
    let dashboard;
    switch (user.Role.toLowerCase()) {
      case 'datamanager':
        dashboard = '/Data_Manager_Dashboard';
        break;
      case 'user':
        dashboard = '/dashboard';
        break;
      case 'superuser':
        dashboard = '/SuperUser_Dashboard';
        break;
      default:
        return res.status(403).json({ message: 'Unauthorized role.' });
    }

    // Send success response with the appropriate dashboard
    return res.status(200).json({
      message: 'Login successful!',
      dashboard,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// Mongoose Schema
const ProductSchema = new mongoose.Schema(
  {
    Ingredient_Name: { type: String, required: true },
    Product_Photo: { type: String, default: '' },
    Nutritional_Information: {
      Energy: { type: Number, default: 0 },
      Protein: { type: Number, default: 0 },
      Carbohydrate: { type: Number, default: 0 },
      Fat: { type: Number, default: 0 },
    },
    Product_Details: {
      FSSAI_License: { type: String, default: '' },
      Manufacturer_Name: { type: String, default: '' },
      Manufacturer_Address: { type: String, default: '' },
      Price: { type: Number, default: 0 },
      Net_Quantity: { type: Number, default: 0 },
      Storage_Instructions: { type: String, default: '' },
      Barcode: { type: String, default: '' },
    },
    Amino_Acids: {
      Histidine: { type: Number, default: 0 },
      Isoleucine: { type: Number, default: 0 },
      Leucine: { type: Number, default: 0 },
      Lysine: { type: Number, default: 0 },
      Methionine: { type: Number, default: 0 },
      Phenylalanine: { type: Number, default: 0 },
      Threonine: { type: Number, default: 0 },
      Tryptophan: { type: Number, default: 0 },
      Valine: { type: Number, default: 0 },
      Alanine: { type: Number, default: 0 },
      Arginine: { type: Number, default: 0 },
      Asparagine: { type: Number, default: 0 },
      Aspartic_Acid: { type: Number, default: 0 },
      Cysteine: { type: Number, default: 0 },
      Glutamic_Acid: { type: Number, default: 0 },
      Glutamine: { type: Number, default: 0 },
      Glycine: { type: Number, default: 0 },
      Proline: { type: Number, default: 0 },
      Serine: { type: Number, default: 0 },
      Tyrosine: { type: Number, default: 0 },
    },
    Vitamins: {
      Carotene: { type: Number, default: 0 },
      Thiamine: { type: Number, default: 0 },
      Riboflavin: { type: Number, default: 0 },
      Niacin: { type: Number, default: 0 },
      Total_B6: { type: Number, default: 0 },
      Folic_Acid: { type: Number, default: 0 },
      Vitamin_C: { type: Number, default: 0 },
    },
    Minerals: {
      Sodium: { type: Number, default: 0 },
      Calcium: { type: Number, default: 0 },
      Phosphorous: { type: Number, default: 0 },
      Iron: { type: Number, default: 0 },
      Choline: { type: Number, default: 0 },
      Magnesium: { type: Number, default: 0 },
      Potassium: { type: Number, default: 0 },
      Copper: { type: Number, default: 0 },
      Manganese: { type: Number, default: 0 },
      Molybdenum: { type: Number, default: 0 },
      Zinc: { type: Number, default: 0 },
      Chromium: { type: Number, default: 0 },
    },
  },
  { collection: 'Product' } // Specify the collection name explicitly
);

// Create a model
const Product = mongoose.model('Product', ProductSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

  // POST endpoint to upload nutrition data
  app.post('/upload-nutrition', async (req, res) => {
    try {
        const productData = req.body;
        const newProduct = new Product(productData);
        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully!' });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ message: 'Failed to add product', error });
    }
});

app.post('/bulk-upload', upload.single('file'), (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
          try {
              // Log the results to see the data being processed
              console.log('CSV Data:', results);

              // Validate and transform data if necessary
              const productsToInsert = results.map(item => {
                  return {
                      Ingredient_Name: item.Ingredient_Name, // Ensure this matches your CSV header
                      Nutritional_Information: {
                          Energy: Number(item.Energy) || 0,
                          Protein: Number(item.Protein) || 0,
                          Carbohydrate: Number(item.Carbohydrate) || 0,
                          Fat: Number(item.Fat) || 0
                      },
                      Product_Details: {
                          FSSAI_License: item.FSSAI_License,
                          Manufacturer_Name: item.Manufacturer_Name,
                          Manufacturer_Address: item.Manufacturer_Address,
                          Price: Number(item.Price) || 0,
                          Net_Quantity: Number(item.Net_Quantity) || 0,
                          Storage_Instructions: item.Storage_Instructions,
                          Barcode: item.Barcode
                      },
                      Amino_Acids: {
                          Histidine: Number(item.Histidine) || 0,
                          Isoleucine: Number(item.Isoleucine) || 0
                      },
                      Vitamins: {
                          Carotene: Number(item.Carotene) || 0,
                          Thiamine: Number(item.Thiamine) || 0
                      },
                      Minerals: {
                          Sodium: Number(item.Sodium) || 0,
                          Calcium: Number(item.Calcium) || 0
                      }
                  };
              });

              // Insert all products into the database
              await Product.insertMany(productsToInsert);
              res.status(201).json({ message: 'Products added successfully!', count: productsToInsert.length });
          } catch (error) {
              console.error('Error saving products:', error);
              res.status(500).json({ message: 'Failed to add products', error: error.message });
          } finally {
              // Delete the uploaded file after processing
              fs.unlinkSync(req.file.path);
          }
      });
});

// Protected Profile Route
app.get('/Profile', async (req, res) => {
  // Note: This route now lacks proper authentication
  try {
    // Find user - this is now unsecured
    const user = await User.findOne().select('-Password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }

  const corsOptions = {
    origin: 'http://foodpandora.com', // Allow only this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    optionsSuccessStatus: 204 // Some legacy browsers choke on 204
  };
  
  app.use(cors(corsOptions));
});

function authenticate(req, res, next) {
  next();
}

// Fetch all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({ Role: 'user' });
    console.log('Returning users:', users);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// Fetch all data Managers
app.get('/data-managers', async (req, res) => {
  try {
      console.log('Fetching data managers...');
      const dataManagers = await DataManager.find({ Role: 'datamanager' });
      console.log('Fetched data managers:', dataManagers);
      res.status(200).json(dataManagers);
  } catch (error) {
      console.error('Error fetching data managers:', error);
      res.status(500).json({ message: 'Failed to fetch data managers.' });
  }
});

// Get user by ID

app.get('/users/:id', async (req, res) => {
  try {
      const userId = req.params.id;
      const user = await User.findOne({ Data_User_ID: parseInt(userId) });
      if (user) {
          res.status(200).json(user);
      } else {
          res.status(404).json({ error: 'User not found' });
      }
  } catch (error) {
      console.error('Error fetching user by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


// Route for fetching a data manager by ID
app.get('/data-managers/:id', async (req, res) => {
  try {
      const managerId = req.params.id;
      const manager = await DataManager.findOne({ Data_Manager_ID: parseInt(managerId, 10) });
      if (manager) {
          res.status(200).json(manager);
      } else {
          res.status(404).json({ error: 'Data manager not found' });
      }
  } catch (error) {
      console.error('Error fetching data manager by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


// Add new user or data manager
app.post('/users', async (req, res) => {
  try {
    const { Name, Email, Phone_Number, Role, Password } = req.body;
    console.log('Request payload: ', req.body);

    // Validate input
    if (!Name || !Email || !Phone_Number || !Role || !Password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    if (Role === 'user') {
      const Data_User_ID = await generateUserId();
      const newUser = new User({
        Data_User_ID,
        Name,
        Email,
        Phone_Number,
        Role,
        Password: hashedPassword,
        Created_At: new Date(),
        Updated_At: new Date(),
      });
      await newUser.save();
      console.log('User added:', newUser);
      const userResponse = { ...newUser.toObject() };
      delete userResponse.Password;
      res.status(201).json({ message: 'User added successfully!', user: userResponse });
    } else if (Role === 'datamanager') {
      const Data_Manager_ID = await generateDataManagerId();
      const newDataManager = new DataManager({
        Data_Manager_ID,
        Name,
        Email,
        Phone_Number,
        Role,
        Password: hashedPassword,
        Created_At: new Date(),
        Updated_At: new Date(),
      });
      await newDataManager.save();
      const managerResponse = { ...newDataManager.toObject() };
      delete managerResponse.Password;
      res.status(201).json({ message: 'Data manager added successfully!', manager: managerResponse });
    } else {
      res.status(400).json({ message: 'Invalid role specified' });
    }
  } catch (error) {
    console.error('Error adding user/manager:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Failed to add user/manager' });
    }
  }
});

//update user and datamanager
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Email, Phone_Number, Role } = req.body;

    console.log('Incoming Update Request:', { id, Name, Email, Phone_Number, Role });

    if (!Name || !Email || !Phone_Number || !Role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const updateData = { Name, Email, Phone_Number, Role, Updated_At: new Date() };

    let account = await User.findOne({ Data_User_ID: parseInt(id, 10) });
    let isUser = true;

    if (!account) {
      account = await DataManager.findOne({ Data_Manager_ID: parseInt(id, 10) });
      isUser = false;
    }

    console.log('Account found:', account);
    console.log('Is user:', isUser);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (Role === 'datamanager' && isUser) {
      console.log('Changing role from user to data manager...');
      await User.deleteOne({ Data_User_ID: parseInt(id, 10) });
      const Data_Manager_ID = await generateDataManagerId();
      console.log('Generated Data_Manager_ID:', Data_Manager_ID);
      const newDataManager = new DataManager({ ...updateData, Data_Manager_ID });
      console.log('New Data Manager Data:', newDataManager);
      await newDataManager.save();
      return res.status(200).json({ message: 'Role changed to Data Manager', account: newDataManager });
    }

    // Handle role change from data manager to user
    if (Role === 'user' && !isUser ) {
      console.log('Changing role from data manager to user...');
      await DataManager.deleteOne({ Data_Manager_ID: parseInt(id, 10) });
      const Data_User_ID = await generateUserId();
      console.log('Generated Data_User _ID:', Data_User_ID);
      const newUser  = new User({ ...updateData, Data_User_ID });
      console.log('New User Data:', newUser );
      await newUser .save();
      return res.status(200).json({ message: 'Role changed to User', account: newUser  });
    }

    // Update the account if the role remains the same
    if (isUser ) {
      await User.findOneAndUpdate({ Data_User_ID: parseInt(id, 10) }, updateData, { new: true });
    } else {
      await DataManager.findOneAndUpdate({ Data_Manager_ID: parseInt(id, 10) }, updateData, { new: true });
    }

    res.status(200).json({ message: 'Account updated successfully', account: updateData });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ message: 'Failed to update account', error: error.message });
  }
});



// Delete a user
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findOneAndDelete({ Data_User_ID: parseInt(id, 10) });
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});


// Delete data manager
app.delete('/data-managers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedManager = await DataManager.findOneAndDelete({ Data_Manager_ID: parseInt(id, 10) });
    if (!deletedManager) {
      return res.status(404).json({ message: 'Data manager not found' });
    }
    res.status(200).json({ message: 'Data manager deleted successfully' });
  } catch (error) {
    console.error('Error deleting data manager:', error);
    res.status(500).json({ message: 'Failed to delete data manager' });
  }
});




// Endpoint for searching products
// app.get('/search', async (req, res) => {
// const { q } = req.query; // Get the search keyword from the query string
// if (!q || q.trim() === '') {
//     return res.status(400).json({ error: 'Search query cannot be empty' });
// }
// try {
//     // Search for products based on the keyword (case-insensitive search)
//     const products = await Product.findOne({ Ingredient_Name: { $regex: q, $options: 'i' } }).limit(10);
//     if (products.length === 0) {
//         return res.status(404).json({ message: 'No products found' });
//     }
//     res.json(products);
// } catch (err) {
//     console.error('Error fetching products:', err);
//     res.status(500).json({ error: 'Server error' });
// }
// });

// Product details endpoint
app.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.sendFile(path.join(__dirname, 'product.html')); // Serve the product page
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Server error');
  }
});
 
// Fetch all products
app.get('/products', async (req, res) => {
try {
  const products = await Product.find();
  res.status(200).json(products);
} catch (error) {
  console.error('Error fetching products:', error);
  res.status(500).json({ message: 'Failed to fetch products.' });
}
});

//fetch product to updatepage
app.get('/getProduct/:id', async (req, res) => {
  try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).send('Product not found');
      res.json(product);
  } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).send('Internal server error');
  }
});

//update the values from product page
app.post('/updateProduct/:id', async (req, res) => {
  try {
      const productId = req.params.id;
      const updatedData = req.body;

      const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true });
      if (!updatedProduct) {
          return res.status(404).json({ message: 'Product not found' });
      }

      res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// Search ingredients endpoint
app.get('/searchnutri', async (req, res) => {
  const query = req.query.query;
  try {
      const results = await Product.find({
          Ingredient_Name: { $regex: query, $options: 'i' } // Case-insensitive search
      }).select('Ingredient_Name Nutritional_Information');
      
      res.json(results);
  } catch (error) {
      console.error('Error fetching ingredients:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

