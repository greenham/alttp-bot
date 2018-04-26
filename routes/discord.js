const express = require('express'),
  router = express.Router(),
  DISCORD = require('discord.js'),
  moment = require('moment-timezone'),
  db = require('../db');

router.get('/', (req, res) => {
	res.render('discord/index');
});

// Discord Settings Control
router.get('/settings', (req, res) => {
	res.render('settings/discord', req.app.locals.config);
});

module.exports = router;