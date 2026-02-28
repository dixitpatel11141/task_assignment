require('dotenv').config();
const { sequelize } = require('./config/config');
const app = require('./app');

// Initialize DB and start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('Models synchronized.');

    const port = process.env.STATUS === 'development' ? process.env.DEV_PORT : process.env.PROD_PORT;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
})();