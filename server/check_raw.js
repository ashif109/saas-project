const { MongoClient } = require('mongodb');

async function check() {
  const uri = "mongodb+srv://ashifansari04704_db_user:FGOy4yvYAssx1qVI@clusterpulse0.g1dsmnh.mongodb.net/pulsedesk?appName=ClusterPulse0";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('pulsedesk');
  const collection = db.collection('User');
  
  const users = await collection.find({ email: 'michealasif41@gmail.com' }).toArray();
  console.log('Raw Users:', JSON.stringify(users, null, 2));
  
  await client.close();
}
check().catch(console.error);
