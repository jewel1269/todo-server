const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { MongoClient, ServerApiVersion } = require('mongodb');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ueeqib1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect to the MongoDB client
    // await client.connect();
    console.log("Successfully connected to MongoDB!");

    // Define database and collection
    const userCollection = client.db("Todo").collection("users");
    const todoCollection = client.db("Todo").collection("allTodos");


    //POST method create a user 
    app.post('/addUser', async (req, res) => {
          const user = req.body;
          console.log(user)
        
          const existingUser = await userCollection.findOne({ email: user.email });
      
          if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
          }
          const result = await userCollection.insertOne(user);
          res.status(200).json({ message: 'Registation successfull!' });
      });

    //   login User

    app.post('/loginUser', async (req, res) => {
        const { email, password } = req.body;
       
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
    
        try {
            const existingUser = await userCollection.findOne({ email });
            
    
            if (!existingUser) {
                return res.status(400).json({ error: 'User does not exist, please register' });
            }
            const isMatch = await (password === existingUser.password);
            console.log(isMatch)
    
            if (isMatch) {
                return res.status(200).json({ message: 'Login successful!' });
            } else {
                return res.status(400).json({ error: 'Invalid password' });
            }
        } catch (error) {
            console.error('Error logging in:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });



    // POST method to add a todo
    app.post('/addTodo', async (req, res) => {
      try {
        const todo = req.body;
        console.log(todo);
        const result = await todoCollection.insertOne(todo);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // Get Method
app.get('/user/:email', async (req, res) => {
 
  const email = req.params.email;
  console.log(email);
  const filter = { email: email };
  const result = await userCollection.findOne(filter);
  res.send(result)
});


//all data get
app.get('/allData/:email', async (req, res) => {
 
  const email = req.params.email;
  console.log(email);
  const filter = { email: email };
  const result = await todoCollection.find(filter).toArray()
  res.send(result)
});



    // Test route
    app.get('/', (req, res) => {
      res.send('Hello Ebitans!!!');
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

//all data get



// Call the run function
run().catch(console.dir);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log("SIGINT signal received: closing MongoDB connection and exiting...");
  await client.close();
  process.exit(0);
});
