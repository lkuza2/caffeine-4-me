var express = require('express');
var router = express.Router();

// DB connection
var coffeeDB = require('mongoose').createConnection('mongodb://localhost/coffee');

// Schemas
var Instruction = require('../schemas/instruction.js');
var Info = require('../schemas/info.js');

/* GET all instructions. */
router.get('/', function(req, res, next) {
  Info.find({}, function(err, info) {
    if(err) res.render('error', { message: "Database error", error: err });

    Instruction.find({}, function(err, instructions) {
      if(err) res.render('error', { message: "Database error", error: err });

      res.render('dev/index', { title: 'Coffee Dev',
                                all_info: info,
                                all_instructions: instructions,
                                num_instructions: instructions.length
      });
    });
  });
});

/* POST to create a test instruction. */
router.post('/instruction/create_test', function(req, res, next) {
  var currentTime = Date.now();
  var instruction = new Instruction();
  instruction.time = currentTime;
  instruction.brew = true;
  instruction.source = "web";

  instruction.save(function(err, obj) {
    if(err) res.send({error:1});
    res.send({error:0});
  });
}); 

/* POST to create test information. */
router.post('/info/create_test', function(req, res) {
  var currentTime = Date.now();
  var info = new Info();
  info.timeBrewed = currentTime;
  info.cups = 3;

  info.save(function(err, obj) {
    if(err) res.send({error:1});
    res.send({error:0});
  });
});

module.exports = router;
