const express = require('express');
const connectDB = require('./src/mongo_config/db');
const cors = require('cors');

const User = require('./src/models/User');
const Role = require('./src/models/Role');
const Job = require('./src/models/Job');

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to FindJob API');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));