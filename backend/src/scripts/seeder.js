const mongoose = require('mongoose');
require('dotenv').config();
const seedProblems = require('../data/seeder');

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/codejudge';
  await mongoose.connect(uri);
  console.log('Connected to DB');
  await seedProblems();
  await mongoose.connection.close();
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
