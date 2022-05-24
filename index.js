const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qydu8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect();

        const productCollection = client.db('manufacturer-website').collection('products');
        const reviewsCollection = client.db('manufacturer-website').collection('reviews');
        const usersCollection = client.db('manufacturer-website').collection('users');

        app.get('/reviews', async (req, res) =>{
            const query = {};
            const result = await reviewsCollection.find(query).toArray();
            res.send(result);
        })
        app.post('/reviews', async (req, res) =>{
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        })
        app.get('/products', async (req, res) =>{
            const query = {};
            const result = await productCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/products', async (req, res) =>{
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        })

        app.get('/users', async (req, res) =>{
            const query = {};
            const result = await usersCollection.find(query).toArray();
            res.send(result);
        })
        app.put('/users/:eamil', async (req, res) =>{
            const email = req.params.email;
            const user = req.body;
            const filter = {email : email};
            const options = {upsert: true};
            const updadedDoc = {
                $set : user
            }
            const result = await usersCollection.updateOne(filter, updadedDoc, options);
            res.send(result);
        })
    }
    finally{

    }
}

run().catch(console.dir);


app.get('/',async (req, res) =>{
    res.send('manufacturer website is runing');
})

app.listen(port, () =>{
    console.log('app is runing on port', port);
})