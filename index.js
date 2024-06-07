const express = require("express");
const cors = require("cors");
//const jwt = require('jsonwebtoken')
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    //   "https://volunteer-link-f176e.web.app",
  ],
  // credentials: true,
  // optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
//app.use(cookieParser());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dizfzlf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    //await client.connect();

    const bannerCollection = client.db("diagnoCareDB").collection("banner");
    const allTestsCollection = client.db("diagnoCareDB").collection("allTests");
    const userCollection = client.db("diagnoCareDB").collection("user");
    const appointmentsCollection = client
      .db("diagnoCareDB")
      .collection("appointments");

    // banner section--------------------------------
    app.get("/banner", async (req, res) => {
      const result = await bannerCollection.find({ status: "true" }).toArray();
      res.send(result);
    });

    app.post("/banner", async (req, res) => {
      const item = req.body;
      const result = await bannerCollection.insertOne(item);
      res.send(result);
    });

    //All tests ---------------------------------------
    //add test
    app.post("/allTests", async (req, res) => {
      const item = req.body;
      const result = await allTestsCollection.insertOne(item);
      res.send(result);
    });

    app.get("/allTests", async (req, res) => {
      const result = await allTestsCollection.find().toArray();
      res.send(result);
    });

    app.delete("/allTests/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allTestsCollection.deleteOne(query);
      res.send(result);
    });

    //update all test--------
    app.patch("/allTests/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          title: item.title,
          shortDescription: item.shortDescription,
          date: item.date,
          report: item.report,
          slots: item.slots,
          price: item.price,
          // image: item.image
        },
      };

      const result = await allTestsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Get a single test data from db using _id
    app.get("/allTests/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allTestsCollection.findOne(query);
      res.send(result);
    });

    // for count update
    app.patch("/allTest/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const slotsCount = req.body;
      const updateOperation = {
        $inc: {
          slots: -1,
        },
      };
      const result = await allTestsCollection.updateOne(
        filter,
        updateOperation
      );
      res.json(result);
    });

    // user section-----------------------------------

    app.post("/user", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // Get all users for admin dashboard-------------------
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // get single user for admin dashboard-------------------------
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      console.log(query);
      res.send(result);
    });

    //Update single user profile/ data---------------
    app.patch("/users/:email", async (req, res) => {
      const item = req.body;
      const email = req.params.email;
      const filter = { email: email };
      const updatedDoc = {
        $set: {
          name: item.name,
          bloodGroup: item.bloodGroup,
          // coupon: item.coupon_code,
          district: item.district,
          upazila: item.upazila,
          // image: item.image
        },
      };

      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Find admin----------------------------
    app.get("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });
    // delete user for admin dashboard----------------
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // Make normal user to admin for admin dashboard----------------

    app.patch("/user/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.patch("/user/block/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "block",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    app.patch("/user/active/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "active",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    //Find block------------------------
    // Find admin----------------------------
    app.get("/users/block/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let block = false;
      if (user) {
        block = user?.status === "block";
      }
      res.send({ block });
    });

    // Admin section=======================================

    // banner get----------
    app.get("/banners", async (req, res) => {
      const result = await bannerCollection.find().toArray();
      res.send(result);
    });

    //single banner get --------------
    app.get("/banner/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bannerCollection.findOne(query);
      res.send(result);
    });

    //banner delete---------------------

    app.delete("/banner/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bannerCollection.deleteOne(query);
      res.send(result);
    });

    //banner update-------------
    app.patch("/banner/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          title: item.title,
          text: item.text,
          coupon_code: item.coupon_code,
          discount_rate: item.discount_rate,
          status: item.status,
          // image: item.image
        },
      };
      const result = await bannerCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    // Appointments related api=============================
    // add appointment by user--------------------------
    app.post("/appointments", async (req, res) => {
      const item = req.body;
      const result = await appointmentsCollection.insertOne(item);
      res.send(result);
    });

    // for all reservation appointment for admin dashboard-----------
    app.get("/appointments", async (req, res) => {
      const result = await appointmentsCollection.find().toArray();
      res.send(result);
    });
    // for report update-------------
    //get single data--------------
    app.get("/appointments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await appointmentsCollection.findOne(query);
      res.send(result);
    });
    //report update and delivered----------
    app.patch("/appointments/:id", async (req, res) => {
      const reportItem = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          report: reportItem.report,
          reportLink: reportItem.reportLink,
          
        },
      };
      const result = await appointmentsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    
    // for cancel reservation------------
     app.delete("/appointments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await appointmentsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("diagnoCare server is running....");
});

app.listen(port, () => {
  console.log(`diagnoCare server is running on port: ${port}`);
});
