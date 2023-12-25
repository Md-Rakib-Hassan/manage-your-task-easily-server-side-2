const express=require('express');
const cors=require('cors');
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express();
const port= process.env.PORT || 5000;
require('dotenv').config();


// middleware
app.use(cors({
  origin:['http://localhost:5173','https://manage-your-task-easily.web.app' ],
  credentials:true,           
  optionSuccessStatus:200
}));
app.use(express.json());
app.use(cookieParser());








const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mldb21f.mongodb.net/?retryWrites=true&w=majority`;

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

    const dataBase = client.db('TaskManager');

const verifyToken=(req,res,next)=>{
  const {token} = req.cookies;

  if(!token){
    return res.status(401).send({message:'You are not authorized'})
  }

  jwt.verify(token,process.env.SECRET_ACCESS_TOKEN,(err,decoded)=>{
    if(err) return res.status(401).send({message:'You are not authorized'})
    req.user=decoded;
    next();
    
  })
}

app.post('/api/v1/todos', async function (req, res) {
  const Collection = dataBase.collection("todos");
  const Info = req.body;
  const result = await Collection.insertOne(Info);
  res.send(result);
})


app.put('/api/v1/update-status/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) }
  const options = { upsert: true };
  const Collection = dataBase.collection("users");
  const {status} = req.body;

  const user = {


    $set: {
      status: status,
    },
  }

  const result = await Collection.updateOne(filter, user, options);
  res.send(result);


})





    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/',(req, res)=>{
    res.send('Hello World');
})

app.listen(port, ()=>{
    console.log(`server listening on ${port}`);
});