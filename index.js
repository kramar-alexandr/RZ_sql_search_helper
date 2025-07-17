import express from 'express';
import { findItemHandler } from './finditem.js';

const app = express();
app.use(express.json());

app.post('/finditem', findItemHandler);

const PORT = process.env.PORT || 300;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
