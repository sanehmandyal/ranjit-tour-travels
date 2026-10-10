import express from 'express';
import { bulkSync, getAllData, seedData } from '../controllers/syncController.js';

const router = express.Router();

router.post('/bulk', bulkSync);
router.post('/seed', seedData);
router.get('/all', getAllData);

export default router;
