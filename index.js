const express = require("express");
const app = express();
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', "interest-cohort=()");
  next();
});

const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// env config
const env = require("dotenv");
env.config();
const jwt = require("jsonwebtoken");

const port = process.env.PORT;
app.use(cors());
app.use(express.json());
// for payment
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)

function createToken(user) {
  return jwt.sign(
    {
      email: user.email,
    },
    "mysecretkey"
  );
}
async function verifyToken(req, res, next) {
  const token = await req?.headers?.authorization?.split(" ")[1];
  await jwt.verify(token, "mysecretkey", (err, decoded) => {
    if (err) {
      res.status(401).send({ status: "Invalid token" });
      return;
    }
    next();
  });
}

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    client.connect();
    console.log("DB Connected Successfully");
    const database = client.db("ticket-fusion-db");
    const eventCollection = database.collection("events");
    const userCollection = database.collection("users");
    const commentCollection = database.collection("comments");
    const sitBookCollection = database.collection("sitBook");
    const paymentCollection = database.collection("payments");

    // comment routes
    app.post("/comments", verifyToken, async (req, res) => {
      const comment = req.body;
      const result = await commentCollection.insertOne(comment);
      res.json(result);
    });
    app.get("/comments", async (req, res) => {
      const cursor = commentCollection.find({});
      const comments = await cursor.toArray();
      res.json(comments);
    });

    // event routes
    app.post("/events", verifyToken, async (req, res) => {
      const event = req.body;
      const result = await eventCollection.insertOne(event);
      res.json(result);
    });
    app.get("/events", async (req, res) => {
      const cursor = eventCollection.find({});
      const events = await cursor.toArray();
      res.json(events);
    });
    app.get("/events/:id", async (req, res) => {
      const id = req.params.id;
      const event = await eventCollection.findOne({ _id: new ObjectId(id) });
      res.json(event);
    });
    app.patch("/events/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedEvent = req.body;
      const { _id, ...restUpdate } = updatedEvent;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: restUpdate,
      };
      const result = await eventCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    app.delete("/events/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await eventCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });
    // setBook routes
    app.post("/sitBook", verifyToken, async (req, res) => {
      const sitBook = req.body;
      // check if there exist a sitBook with the same email and eventId
      const filter = { email: sitBook.email, eventId: sitBook.eventId };
      const existingSitBook = await sitBookCollection.findOne(filter);

      if (!existingSitBook) {
        const result = await sitBookCollection.insertOne(sitBook);
        res.json({ ...result, message: "Ticket Book Successfully" });
      } else {
        const newTicketNumber =
          existingSitBook.ticketNumber + parseInt(sitBook.ticketNumber);
        const newMoney =
          parseInt(existingSitBook.price) + parseInt(sitBook.price);
        const updateDoc = {
          $set: {
            ticketNumber: newTicketNumber,
            price: newMoney,
          },
        };

        const result = await sitBookCollection.updateOne(filter, updateDoc);
        res.json({ ...result, message: "Ticket Update Book Successfully" });
      }
    });
    app.get("/sitBook", async (req, res) => {
      const cursor = sitBookCollection.find({});
      const sitBooks = await cursor.toArray();
      res.json(sitBooks);
    });

    app.get("/singleSitBook/:id", async (req, res) => {
      const id = req.params.id;
      const sitBook = await sitBookCollection.findOne({
        _id: new ObjectId(id),
      });
      res.json(sitBook);
    });

    app.delete("/sitBook/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await sitBookCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });
    // get setBook by eventId and email
    app.get("/sitBook/:eventId/:email", async (req, res) => {
      const eventId = req.params.eventId;
      const email = req.params.email;
      const sitBook = await sitBookCollection.findOne({
        eventId: eventId,
        email: email,
      });
      res.json(sitBook);
    });

    //  update sitBook
    app.patch("/sitBook/:id", async (req, res) => {
      const id = req.params.id;
      const updatedSitBook = req.body;
      const { _id, ...restUpdate } = updatedSitBook;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: restUpdate,
      };
      const result = await sitBookCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    // filter sitBook by event id
    app.get("/filterByEventID/:eventId", async (req, res) => {
      const eventId = req.params.eventId;
      const sitBook = await sitBookCollection
        .find({ eventId: eventId })
        .toArray();
      res.json(sitBook);
    });
    // filter sitBook by email
    app.get("/filterByEmail/:email", async (req, res) => {
      const email = req.params.email;
      const sitBook = await sitBookCollection.find({ email: email }).toArray();
      res.json(sitBook);
    });

    // user routes
    app.post("/users", async (req, res) => {
      const user = req.body;
      const token = createToken(user);
      const filter = { email: user.email };
      if (user.email === "") {
        res.status(400).send({ status: "Email  can not be empty" });
        return;
      }
      const existingUser = await userCollection.findOne(filter);
      if (existingUser) {
        res.status(400).send({ status: "Success Email already exists", token });
        return;
      }
      const result = await userCollection.insertOne(user);
      res.json({ status: "Success add user to DB", token });
    });
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.json(users);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      res.json(user);
    });
    app.patch("/users/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const updatedUser = req.body;
      const { _id, ...restUpdate } = updatedUser;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: restUpdate,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    // payment routes
      // create payment intent
      app.post('/create-payment-intent', verifyToken, async (req, res) => {
        const { price } = req.body;
        const amount = parseInt(price * 100);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method_types: ['card']
        });

        res.send({
            clientSecret: paymentIntent.client_secret
        })
    })


    // payment related api
    app.post('/payments', async (req, res) => {
        const payment = req.body;
        const insertResult = await paymentCollection.insertOne(payment);

        const query = { _id: new ObjectId(payment.itemId) }
        const deleteResult = await sitBookCollection.deleteOne(query)
        res.send({ ...insertResult, deleteResult });
    })
    // get Payment History 
    app.get('/paymentHistory/:email', async (req, res) => {
        const email = req.params.email;
        let query={};
        if (email) {
            query = { email: email };
        }
        const result = await paymentCollection.find(query).sort({ fieldToSort: -1 }).toArray();
        res.send(result)
    })
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Route is working");
});

app.listen(port, () => {
  console.log(`Ticket Fusion Server is running on port ${port}`);
});
