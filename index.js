const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("studyMateDB");
    const partnersCollection = db.collection("partners");

    // CREATE - Add a new partner
    app.post("/partners", async (req, res) => {
      const newPartner = req.body;
      const result = await partnersCollection.insertOne(newPartner);
      res.send(result);
    });

    // READ - Get all partners
    app.get("/partners", async (req, res) => {
      const result = await partnersCollection.find().toArray();
      res.send(result);
    });

    // READ - Get partner by ID
    app.get("/partners/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await partnersCollection.findOne(query);
      res.send(result);
    });

    // READ - My Connections (by user email)
    app.get("/myConnections", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send({ message: "Email query required" });
      }
      const result = await partnersCollection.find({ email }).toArray();
      res.send(result);
    });

    // UPDATE - Edit partner info
    app.put("/partners/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      const query = { _id: new ObjectId(id) };
      const updates = {
        $set: {
          name: updatedData.name,
          profileImage: updatedData.profileImage,
          subject: updatedData.subject,
          studyMode: updatedData.studyMode,
          availabilityTime: updatedData.availabilityTime,
          location: updatedData.location,
          experienceLevel: updatedData.experienceLevel,
          rating: updatedData.rating,
          email: updatedData.email,
        },
      };
      const result = await partnersCollection.updateOne(query, updates);
      res.send(result);
    });

    // PATCH - Increment partner request count
    app.patch("/sendRequest/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = { $inc: { partnerCount: 1 } };
      const result = await partnersCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

run().catch(console.dir);

// Default route
app.get("/", (req, res) => {
  res.send("Study Partner Server is running successfully!");
});

app.listen(port, () => {
  console.log(` Server is running on port: ${port}`);
});
