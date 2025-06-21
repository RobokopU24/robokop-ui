import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load env variables
dotenv.config();

// __dirname replacement for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import routes (make sure routes file also uses ESM syntax)
import routes from './api_routes/routes.js';

const app = express();
const PORT = process.env.PORT || 7080;

// Set axios request max size
axios.defaults.maxContentLength = Infinity;
axios.defaults.maxBodyLength = Infinity;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '4000mb' }));
app.use(morgan('dev'));

// Add routes
app.use('/api', routes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'pack')));

// Fallback to React index.html
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/static')) {
    res.sendFile(path.resolve(__dirname, 'pack', 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`🌎 ==> qgraph running on port ${PORT}!`);
});
