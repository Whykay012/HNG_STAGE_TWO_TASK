// Option 1: Explicitly point to the .env file in the parent directory
require('dotenv').config({ path: '../.env' }); 

const mongoose = require('mongoose');
const Profile = require('../model/profile'); // Goes up one level to find the model
const fs = require('fs');
const { uuidv7 } = require('uuidv7');

const seedData = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    
    // Safety check: Ensure the URI was actually loaded
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in your .env file. Check the path or variable name.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✨ Database Connected Successfully");
    
    
const rawData = JSON.parse(fs.readFileSync('../profiles_seed.json', 'utf-8'));
const data = rawData.profiles; // Extract the array from the "profiles" key

    console.log(`📦 Found ${data.length} profiles. Starting seed...`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const item of data) {
      // Use findOneAndUpdate with upsert: true to prevent duplicates
      const result = await Profile.findOneAndUpdate(
        { name: item.name.toLowerCase() }, // Check for existing name
        { 
          $setOnInsert: { 
            _id: uuidv7(), 
            ...item,
            name: item.name.toLowerCase(),
            created_at: new Date()
          } 
        },
        { upsert: true, new: true, rawResult: true }
      );

      // result.lastErrorObject.updatedExisting is true if a record was found and updated
      if (result.lastErrorObject && result.lastErrorObject.updatedExisting) {
        skippedCount++;
      } else {
        addedCount++;
      }
    }

    console.log(`✅ Seeding Complete!`);
    console.log(`🚀 Added: ${addedCount} | ⏩ Skipped (Duplicates): ${skippedCount}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedData();