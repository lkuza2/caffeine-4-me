var express = require('express');
var router = express.Router();

// DB connection
var coffeeDB = require('mongoose').createConnection('mongodb://localhost/coffee');
var Instruction = require('../schemas/instruction.js');
var manualBrew = 0;

// Functor to sort JSON in an array by the time
function compare(a,b) {
  if(a.time < b.time) return -1;
  if(a.time > b.time) return 1;
  return 0;
}

/* GET check for instructions */
router.get('/query', function(req, res, next) {
  var time = Date.now();

  if(manualBrew == 1) {
    res.send( {brew:1} );
  }
  else {
    Instruction.find({}, function(err, instructionArr) {
      // Sort all instructions
      instructionArr.sort(compare);

      // No instructions.
      if(instructionArr.length == 0) {
        res.send( {brew:0} );
      }
      else {
        if(instructionArr[0].time <= time) {
          res.send( {brew:1} );
        }
        else {
          res.send( {brew:0} );
        }
      }
    });
  }
});

/* POST send status of coffee machine to server */
router.post('/status', function(req, res, next) {
  var brew = req.body.brew;
  var time = req.body.time;
  var currentTime = Date.now();

  Instruction.find({}, function(err, instructionArr) {
    if(brew == 0) {
      // Stop ALL brewing. Reset manual and delete old instructions.
      manualBrew = 0;

      // Sort instructions
      instructionArr.sort(compare);

      if(instructionArr.length > 0) {
        var i=0;
        while(instructionArr[i].time <= currentTime && i < instructionArr.length) {
          i++;
          instructionArr[i].remove();
        }
      }
    }

    res.send({error:0});
  });
});

/* POST create an instruction */
router.post('/instruction/create/now', function(req, res, next) {
  if(manualBrew == 1) manualBrew = 0;
  else if(manualBrew  == 0) manualBrew = 1;

  res.redirect('/');
});

/* POST create an instruction. */
router.post('/instruction/create/schedule', function(req, res, next) {
  var rawDate = req.body.datepickerDate;
  var rawTime = req.body.timepicker;

  // Split date by hyphens
  var date = rawDate.split('-');
  var time = rawTime.split(':');

  var year = date[2];
  var month = date[1];
  var day = date[0];
  var hour = time[0];
  var minute = time[1];
  var second = time[2];

  // Get UTC time.
  var timeUTC = Date.UTC(year, month, day, hour, minute, second);

  // Create document.
  var instruction = new Instruction();
  instruction.time = timeUTC;
  instruction.brew = 1;
  instruction.source = "web";

  // Try saving.
  instruction.save(function(err, instruction) {
    if(err) res.render('error', {message:"Can't schedule a brew at this time", error:err});
    res.redirect('/');
  });
});

/* GET DEBUG for manual brew */
router.get('/instruction/view/now', function(req, res, next) {
  res.send({"manual":manualBrew});
});

module.exports = router;
