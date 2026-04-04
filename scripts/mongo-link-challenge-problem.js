// DEV: run with `mongosh codejudge < scripts/mongo-link-challenge-problem.js` (adjust ObjectIds for your DB).
db.weeklychallenges.updateOne(
  { _id: ObjectId('69cf88db9fc54cfe7dc93aed') },
  { $addToSet: { problems: ObjectId('69cf8e4025d070e7936ba27b') } }
);
