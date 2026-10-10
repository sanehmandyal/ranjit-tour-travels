import express from 'express';
import { bulkSync, getAllData } from '../controllers/syncController.js';

const router = express.Router();

router.post('/bulk', bulkSync);
router.get('/all', getAllData);

export default router;
