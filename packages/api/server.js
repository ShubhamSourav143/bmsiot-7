require('dotenv').config();
const express = require('express');
const cors = require('cors');
const loginHandler = require('./auth/login');
const batteryHandler = require('./battery/[id]');
const fleetReportHandler = require('./reports/fleet');
const usersHandler = require('./admin/users');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/auth/login', loginHandler);
app.get('/api/battery/:id', batteryHandler);
app.get('/api/reports/fleet', fleetReportHandler);
app.get('/api/admin/users', usersHandler);
app.post('/api/admin/users', usersHandler);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

