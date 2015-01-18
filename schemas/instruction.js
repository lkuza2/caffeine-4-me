var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = mongoose.createConnection('mongodb://localhost/coffee');

var instructionSchema = new Schema({
  time: Date,
  brew: Boolean,
  source: String
});

var Instruction = db.model('Instruction', instructionSchema);

module.exports = Instruction;
