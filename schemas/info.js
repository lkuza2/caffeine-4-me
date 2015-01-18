var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = mongoose.createConnection('mongodb://localhost/coffee');

var infoSchema = new Schema({
  timeBrewed: Date,
  cups: Number
});

var Info = db.model('Info', infoSchema);

module.exports = Info;
