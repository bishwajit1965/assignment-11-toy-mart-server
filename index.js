const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const { ObjectId } = require("mongodb");

// Middlewares
app.use(cors());
app.use(express.json());

// Mongo db connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.l3p6wcn.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Collections
    const toysCollection = client.db("toy-mart").collection("toys");
    const toysGalleryCollection = client
      .db("toy-mart")
      .collection("gallery-images");
    const topSellersCollection = client
      .db("toy-mart")
      .collection("top-sellers");
    const bestSellingToysCollection = client
      .db("toy-mart")
      .collection("best-selling-toys");
    const subCategoryCollection = client
      .db("toy-mart")
      .collection("sub-category");

    // Retrieve sub categories
    app.get("/sub-category", async (req, res) => {
      const cursor = subCategoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Insert sub category
    app.post("/sub-category", async (req, res) => {
      const toy = req.body;
      const result = await subCategoryCollection.insertOne(toy);
      res.send(result);
    });

    // Will face data according to subCategory id
    app.get("/toy-data", async (req, res) => {
      try {
        const subCategoryId = req.query.id;
        const toys = await toysCollection
          .find({ subCategory: subCategoryId })
          .toArray();
        res.send(toys);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred" });
      }
    });

    // Retrieve all toys
    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Toys as per logged in user email
    app.get("/toy", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const userToys = await toysCollection.find(query).toArray();
      res.send(userToys);
    });

    // Get specific toy as per id
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: {
          _id: 1,
          toyUrl: 1,
          toyName: 1,
          sellerName: 1,
          email: 1,
          subCategory: 1,
          price: 1,
          rating: 1,
          quantity: 1,
          description: 1,
        },
      };
      const result = await toysCollection.findOne(query, options);
      res.send(result);
    });

    // Insert a toy
    app.post("/toys", async (req, res) => {
      const toy = req.body;
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    });

    // Update toy data
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const update = req.body;
      const coffee = {
        $set: {
          toyUrl: update.toyUrl,
          toyName: update.toyName,
          toyName: update.toyName,
          email: update.email,
          subCategory: update.subCategory,
          price: update.price,
          rating: update.rating,
          quantity: update.quantity,
          description: update.description,
        },
      };
      const result = await toysCollection.updateOne(filter, coffee, options);
      res.send(result);
    });

    // Delete a toy
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(cursor);
      res.send(result);
    });

    app.post("/gallery-images", async (req, res) => {
      const galleryImage = req.body;
      const result = await toysGalleryCollection.insertOne(galleryImage);
      res.send(result);
    });

    app.get("/gallery-images", async (req, res) => {
      const cursor = toysGalleryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Post Top sellers
    app.post("/top-sellers", async (req, res) => {
      const topSellerImages = req.body;
      const result = await topSellersCollection.insertOne(topSellerImages);
      res.send(result);
    });

    // Retrieve Top sellers
    app.get("/top-sellers", async (req, res) => {
      const cursor = topSellersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Retrieve Top selling toys
    app.get("/best-selling-toys", async (req, res) => {
      const cursor = bestSellingToysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Best selling toys
    app.post("/best-selling-toys", async (req, res) => {
      const bestSellingToys = req.body;
      const result = await bestSellingToysCollection.insertOne(bestSellingToys);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy mart server is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
