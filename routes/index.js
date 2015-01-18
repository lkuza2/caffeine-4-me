var express = require('express');
var router = express.Router();
var Instruction = require('../schemas/instruction.js');

function compare(a,b) {
  if(a.time < b.time) return -1;
  if(a.time > b.time) return 1;
  return 0;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var more;

  Instruction.find({}, function(err, instructions) {
    if(err) res.render('error', { message: "Error loading schedule", error: err});

    console.log('Got ' + instructions.length + ' instructions');

    // Send first 5 instructions. Truncates and sets more to true if too many.
    instructions.sort(compare);
    if(instructions.length > 5) {
      instructions.slice(0,5);
      more = true;
    }
    else more = false;

    res.render('index', { title: 'Caffeine 4 Me', schedule:JSON.stringify(instructions), more:more });
  });
});

module.exports = router;
