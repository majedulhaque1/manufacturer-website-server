const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qydu8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyJWT = (req, res, next) =>{
    const authheader = req.headers.authorization;
    if(!authheader){
        return res.status(401).send({message : 'unauthorize access'});
    }
    const token = authheader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbiden access'});
        }
        req.decoded = decoded;
        next();
    })
}
async function run(){
    try{
        await client.connect();

        const productCollection = client.db('manufacturer-website').collection('products');
        const reviewsCollection = client.db('manufacturer-website').collection('reviews');
        const usersCollection = client.db('manufacturer-website').collection('users');
        const ordersCollection = client.db('manufacturer-website').collection('orders');
        const profilesCollection = client.db('manufacturer-website').collection('profiless');
        
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
        app.get('/products/:Id', verifyJWT, async (req, res) =>{
            const id = req.params.Id;
            const query = {_id : ObjectId(id)};
            const result = await productCollection.findOne(query);
            res.send(result);
        })
        app.delete('/products/:Id', verifyJWT, async (req, res) =>{
            const id = req.params.Id;
            const query = {_id : ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        app.post('/products', async (req, res) =>{
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        })
        app.get('/profile', async (req, res) =>{
            const query = {};
            const result = await profilesCollection.find(query);
            res.send(result);
        })
        app.post('/profile', async (req, res) =>{
            const info = req.body;
            const result = await profilesCollection.insertOne(info);
            res.send(result);
        })
        app.get('/orders', verifyJWT, async (req, res) =>{
            const buyer = req.query.buyer;
            const filter = {email: buyer};
            console.log(buyer);
            const result = await ordersCollection.find(filter).toArray();
            res.send(result);
        })
        app.get('/allorders', async (req, res) =>{
            const filter = {};
            const result = await ordersCollection.find(filter).toArray();
            res.send(result);
        })
        app.post('/orders', async (req, res) =>{
            const order = req.body;
            console.log(order)
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })

        app.get('/users', verifyJWT, async (req, res) =>{
            const query = {};
            const result = await usersCollection.find(query).toArray();
            res.send(result);
        })
        app.get('/admin/:email',async (req, res) =>{
            const email = req.params.email;
            const user = await usersCollection.findOne({email : email});
            const isAdmin = user.role === 'admin';
            res.send({admin: isAdmin});
        })
        app.patch('/users/admin/:email', verifyJWT, async (req, res) =>{
            const email = req.params.email;
            const requester = req.decoded.email;
            const filter = { email : requester};
            console.log(requester);
            const requesterEmail = await usersCollection.findOne(filter);
            console.log(requesterEmail);
            if(requesterEmail.role === 'admin'){
                const filter = {email : email};
                const updadedDoc = {
                    $set : {role : 'admin'}
                }
                const result = await usersCollection.updateOne(filter, updadedDoc);
                res.send(result);
            }
        })
        app.put('/users/:email', async (req, res) =>{
            const email = req.params.email;
            const user = req.body;
            const filter = {email : email};
            const options = {upsert: true};
            const updadedDoc = {
                $set : user
            }
            const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn : '1h'});
            const result = await usersCollection.updateOne(filter, updadedDoc, options);
            res.send({result, token});
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