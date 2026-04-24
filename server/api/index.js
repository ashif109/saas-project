const app = require('../server.js');

app.use('/api/colleges', require('./routes/collegeRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/system', require('./routes/systemRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));

// Database verification endpoint

module.exports = app;
