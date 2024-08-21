const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middlewares
app.use(cors({
    origin: [
      "http://localhost:5173",
      "https://atic-delivery-matrix.netlify.app",

    ]
  }));
app.use(express.json());



const uri = `mongodb+srv://${process.env.DU_USER}:${process.env.DB_PASSWORD}@cluster0.ms3r4qf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const parcelCollection = client.db("deliver_matrix_db").collection("parcel_collection");
    const usersCollection = client.db("deliver_matrix_db").collection("users_collection");
    const reviewCollection = client.db("deliver_matrix_db").collection("review_collection");
    const paymentCollection = client.db("deliver_matrix_db").collection("payments_collection");


    //users related api


    app.get('/user/:email', async(req, res) =>{
        const email = req.params.email
        const result = await usersCollection.findOne({email})
        res.send(result)
    })


    app.get('/users', async(req, res) =>{
        const result = await usersCollection.find().toArray()
        res.send(result)
    })


    app.get('/users/:id', async(req, res) =>{
        const user = req.body
        const query = {email: user.email}
        const result = await usersCollection.find().toArray()
        res.send(result)
    })



    app.post('/users', async(req, res)=>{
        const user = req.body;
        const query = {email: user.email}
        const existingUser = await usersCollection.findOne(query)
        if(existingUser){
            return res.send({message: 'user already exists' , insertedId: null})
        }
        const result = await usersCollection.insertOne(user)
        res.send(result)
    })


    app.patch('/users/admin/:id', async (req, res) =>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id) }
        const updatedDoc ={
            $set:{
                role: 'admin'
            }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc)
        res.send(result)
    })


    //post review
    app.patch('/users/deliveryMan/:id', async (req, res) =>{
        const id = req.params.id
        console.log(id);
        const filter = {_id: new ObjectId(id) }
        const options = {upsert: true}
        const data = req.body
        const review ={
            $set:{
                revUserName: data.revUserName,
                revPhotoURL: data.revPhotoURL,
                revDeliveryManId: data.revDeliveryManId,
                revRating: data.revRating,
                revFeedback: data.revFeedback,
                date: data.date
            }
        }
        const result = await usersCollection.updateOne(filter, review, options)
        res.send(result)
    })


    
    app.patch('/users/usersStatus/:id', async (req, res) =>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id) }
        const updatedDoc ={
            $set:{
                status: 'cancelled'
            }
        }
        const result = await parcelCollection.updateOne(filter, updatedDoc)
        res.send(result)
    })


    app.patch('/users/cancel/:id', async (req, res) =>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id) }
        const updatedDoc ={
            $set:{
                status: 'cancelled'
            }
        }
        const result = await parcelCollection.updateOne(filter, updatedDoc)
        res.send(result)
    })


    app.patch('/users/deliver/:id', async (req, res) =>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id) }
        const updatedDoc ={
            $set:{
                status: 'delivered'
            }
        }
        const result = await parcelCollection.updateOne(filter, updatedDoc)
        res.send(result)
    })


    app.patch('/users/makeDeliveryMan/:id', async (req, res) =>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id) }
        const updatedDoc ={
            $set:{
                role: 'deliveryMan'
            }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc)
        res.send(result)
    })


    app.patch('/updated-parcel/:id', async (req, res) =>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id) }
        const options = {upsert: true}
        const updatedParcel = req.body
        const parcel ={
            
            $set:{
                name: updatedParcel.displayName,
                email: updatedParcel.email,
                parcelType: updatedParcel.parcelType,
                parcelWeight: updatedParcel.parcelWeight,
                phoneMobile: updatedParcel.number,
                receiverName: updatedParcel.receiverName,
                receiverNumber: updatedParcel.receiverNumber,
                parcelDeliveryAddress: updatedParcel.parcelDeliveryAddress,
                requestedDeliveryDate: updatedParcel.requestedDeliveryDate,
                latitude: updatedParcel.latitude,
                longitude: updatedParcel.longitude,
                // price: cost,
                // bookingDate: date,
                // status: "pending"
            }
        }
        const result = await parcelCollection.updateOne(filter, parcel, options)
        res.send(result)
    })

    //send delivery data to deliveryman's collection
    app.patch('/updated-delivery/:id', async (req, res) =>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id) }
        const options = {upsert: true}
        const updatedParcel = req.body
        const parcel ={
            
            $set:{
                name: updatedParcel.displayName,
                email: updatedParcel.email,
                parcelType: updatedParcel.parcelType,
                parcelWeight: updatedParcel.parcelWeight,
                phoneMobile: updatedParcel.number,
                receiverName: updatedParcel.receiverName,
                receiverNumber: updatedParcel.receiverNumber,
                parcelDeliveryAddress: updatedParcel.parcelDeliveryAddress,
                requestedDeliveryDate: updatedParcel.requestedDeliveryDate,
                latitude: updatedParcel.latitude,
                longitude: updatedParcel.longitude,
                // price: cost,
                // bookingDate: date,
                // status: "pending"
            }
        }
        const result = await parcelCollection.updateOne(filter, parcel, options)
        res.send(result)
    })


    //assign delivery 
    app.patch('/assign-parcel/:id', async (req, res) =>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id) }
        const options = {upsert: true}
        const data = req.body
        const assignedParcel ={
            
            $set:{
                
                approximateDeliveryDate: data.approximateDeliveryDate,
                assignedDeliveryManId: data.assignedDeliveryManId,
                assignedDeliveryManEmail:data.assignedDeliveryManEmail,
                status:'on the way',
                managedId: data.managedId
            }
        }
        const result = await parcelCollection.updateOne(filter, assignedParcel, options)
        res.send(result)
    })

    //get single parcel data by id
    app.get('/parcel/:id', async (req, res) =>{
        const id = req.params.id
        const query = {_id: new ObjectId(id)} 
        const result = await parcelCollection.findOne(query)
        res.send(result)
    })


    //get parcel info from specific email
    app.get('/parcel-collection', async(req, res) =>{
        const email = req.query.email
        const query ={email: email}
        const result = await parcelCollection.find(query).toArray();
        res.send(result)
    })

    app.get('/reviews', async(req, res) =>{
        const email = req.query.email
        const query ={email: email}
        const result = await reviewCollection.find(query).toArray();
        res.send(result)
    })

    //get all parcels
    app.get('/all-parcels', async(req, res) =>{
        const result = await parcelCollection.find().toArray();
        res.send(result)
    })
    app.get('/users/reviews', async(req, res) =>{
        const result = await reviewCollection.find().toArray();
        res.send(result)
    })

    //book parcel
    app.post('/book-parcel', async(req, res) =>{
        const bookedParcel = req.body;
        const result = await parcelCollection.insertOne(bookedParcel)
        res.send(result)
    })


    app.post('/users/reviews', async(req, res) =>{
        const data = req.body;
        const result = await reviewCollection.insertOne(data)
        res.send(result)
    })

    app.post('/create-payment-intent', async (req,res) =>{
        const {price} = req.body
        const amount = parseInt(price * 100);
        console.log(amount, 'amount inside the intent');

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method_types: ['card']
        });
        res.send({
            clientSecret: paymentIntent.client_secret
        })
    })

    app.post('/payments', async(req, res) =>{
        const payment = req.body
        const paymentResult = await paymentCollection.insertOne(payment)
        console.log('payment info:', payment)
        res.send(paymentResult)
    })

    app.get('/payments/:email', async(req, res) =>{
        const query = {email: req.params.email}
        const result = await paymentCollection.find(query).toArray()   
        res.send(result)
        

    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send('deliver matrix server is running')
})

app.listen(port, () =>{
    console.log(`deliver matrix server is running on port: ${port}`);
})