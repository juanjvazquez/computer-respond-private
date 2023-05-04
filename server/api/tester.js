
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://juanv:UA3O7DI916iFjqP6@computer-respond.4sr2x4d.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

async function createDocument(collection, document) {
    const result = await collection.insertOne(document);
    console.log('Document inserted:', result.insertedId);
}
  
async function main() {
    await client.connect();
    const collection = client.db('test').collection('users');
  
    const document = { name: 'John Doe', age: 30 };
    await createDocument(collection, document);
  
    await client.close();
}
  
main().catch(console.error);
