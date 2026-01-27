const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017';
const DB_NAME = process.env.DB_NAME || 'devops_db';
const COLLECTION_NAME = 'products';

let db = null;
let client = null;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
    
    // Initialize products collection with sample data if empty
    const collection = db.collection(COLLECTION_NAME);
    const count = await collection.countDocuments();
    
    if (count === 0) {
      const sampleProducts = [
        {
          id: '1',
          name: 'Laptop Pro',
          price: 1299.99,
          description: 'High-performance laptop for professionals'
        },
        {
          id: '2',
          name: 'Wireless Mouse',
          price: 29.99,
          description: 'Ergonomic wireless mouse with precision tracking'
        },
        {
          id: '3',
          name: 'Mechanical Keyboard',
          price: 149.99,
          description: 'RGB mechanical keyboard with cherry switches'
        },
        {
          id: '4',
          name: '4K Monitor',
          price: 399.99,
          description: '27-inch 4K UHD monitor with HDR support'
        },
        {
          id: '5',
          name: 'USB-C Hub',
          price: 49.99,
          description: 'Multi-port USB-C hub with HDMI and SD card reader'
        }
      ];
      
      await collection.insertMany(sampleProducts);
      console.log('Initialized products collection with sample data');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Continue running even if MongoDB connection fails
    // Products will be served from memory as fallback
  }
}

// Fallback products (used if MongoDB is unavailable)
const fallbackProducts = [
  {
    id: '1',
    name: 'Laptop Pro',
    price: 1299.99,
    description: 'High-performance laptop for professionals'
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    price: 29.99,
    description: 'Ergonomic wireless mouse with precision tracking'
  },
  {
    id: '3',
    name: 'Mechanical Keyboard',
    price: 149.99,
    description: 'RGB mechanical keyboard with cherry switches'
  }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get products endpoint
app.get('/products', async (req, res) => {
  try {
    if (db) {
      const collection = db.collection(COLLECTION_NAME);
      const products = await collection.find({}).toArray();
      // Remove MongoDB _id field
      const formattedProducts = products.map(({ _id, ...product }) => product);
      res.json(formattedProducts);
    } else {
      // Fallback to in-memory products
      res.json(fallbackProducts);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback to in-memory products on error
    res.json(fallbackProducts);
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Service running on port ${PORT}`);
  // Connect to MongoDB after server starts
  connectToMongoDB();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing MongoDB connection...');
  if (client) {
    await client.close();
  }
  process.exit(0);
});
