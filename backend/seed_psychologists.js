require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const samplePsychologists = [
      {
        name: "Dr. Sarah Jenkins",
        email: "sarah.jenkins@behold.test",
        phone: "+919800000001",
        role: "psychologist",
        type: "counselling",
        title: "Clinical Psychologist",
        price: 899,
        halfSessionPrice: 499,
        modes: ["ONLINE", "OFFLINE"],
        isActive: true,
        isVerified: true,
        status: "ACTIVE",
        bio: "Specializes in cognitive behavioral therapy with 10 years of experience.",
        experience: "10 Years",
        createdAt: new Date(),
        updatedAt: new Date(),
        availability: {
          "monday": [{ start: "10:00", end: "14:00" }],
          "wednesday": [{ start: "14:00", end: "18:00" }]
        }
      },
      {
        name: "Dr. Ahmed Khan",
        email: "ahmed.khan@behold.test",
        phone: "+919800000002",
        role: "counsellor",
        type: "counselling",
        title: "Therapeutic Advisor",
        price: 899,
        halfSessionPrice: 499,
        modes: ["ONLINE", "DOOR_STEP"],
        isActive: true,
        isVerified: true,
        status: "ACTIVE",
        bio: "Focuses on adolescent therapy and family counseling.",
        experience: "6 Years",
        createdAt: new Date(),
        updatedAt: new Date(),
        availability: {
          "tuesday": [{ start: "09:00", end: "13:00" }],
          "friday": [{ start: "15:00", end: "19:00" }]
        }
      }
    ];

    const result = await db.collection('users').insertMany(samplePsychologists);
    console.log(`Successfully seeded ${result.insertedCount} psychologists.`);
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    process.exit(0);
  }
}

seed();
