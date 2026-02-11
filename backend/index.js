const express = require('express');
const cors = require('cors');
const churchesRouter = require('./routes/churches');
const priestsRouter = require('./routes/priests');
const massesRouter = require('./routes/masses');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/churches', churchesRouter);
app.use('/api/priests', priestsRouter);
app.use('/api/masses', massesRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Diocese Franca API',
    version: '1.0.0',
    endpoints: {
      churches: '/api/churches',
      priests: '/api/priests',
      masses: '/api/masses'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
