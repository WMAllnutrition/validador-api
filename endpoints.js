const express = require('express');
const validateRoutes = require('./endpoints/validate');
const dataRoutes = require('./endpoints/data');
const generatorRoutes = require('./endpoints/generator');

const router = express.Router();

router.use('/api', validateRoutes);
router.use('/api', dataRoutes);
router.use('/api', generatorRoutes);

module.exports = router;