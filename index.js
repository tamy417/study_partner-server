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

const uri = process.env.MONGO_URI;

// const uri = "mongodb+srv://study-partner:FKyhBq8kEXmT8a2e@cluster0.j4lmmay.mongodb.net/?appName=Cluster0";

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

    // post route
    app.post("/partners", async (req, res) => {
      const newPartner = req.body;
      const result = await partnersCollection.insertOne(newPartner);
      res.send(result);
    });

    // get all partners
    app.get("/partners", async (req, res) => {
      const result = await partnersCollection.find().toArray();
      res.send(result);
    });

    // get by Id
    app.get("/partners/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await partnersCollection.findOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(" Connected to MongoDB successfully!");
  } catch (error) {
    console.error(" MongoDB connection failed:", error);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(" StudyMate Server is running!");
});

app.listen(port, () => {
  console.log(` Server is running on port: ${port}`);
});
