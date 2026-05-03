const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

router.post('/detect', newsController.analyzeNews);
router.get('/stats', newsController.getStats);
router.get('/history', newsController.getHistory);
router.delete('/history/:id', newsController.deleteHistory);
router.delete('/history', newsController.clearHistory);

module.exports = router;
