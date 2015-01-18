/*********************************************
 * Auto Coffee
 *********************************************/

var tessel = require('tessel');
var http = require('http');
var myip = require('my-ip');
var relayStatus = false;
var relaylib = require('relay-mono');
var relay = relaylib.use(tessel.port['A']);
var request = require('request');
var gpio = tessel.port['GPIO']; // select the GPIO port
var statusPin = gpio.digital[2]; // on GPIO, can be gpio.digital[0] through 5 or gpio.pin['G3'] through ‘G6’
var brewSwitch = gpio.digital[4]; // on GPIO, can be gpio.digital[0] through 5 or gpio.pin['G3'] through ‘G6’

// Wait for the module to connect
relay.on('ready', function relayReady () {
    console.log('Ready!');
});

// When a relay channel is set, it emits the 'latch' event
relay.on('latch', function(channel, value) {
    console.log('latch on relay channel ' + channel + ' switched to', value);

});
    // you're connected
    var auto;
    var safe;
    var connected;
    var safeOff = false;
    setInterval(function toggle() {
        var override = brewSwitch.rawRead();
        if(safeOff == true){
            setBrew(false);
        }else {
            setImmediate(function start() {
                http.get("http://sgodbold.com:3000/coffee/query", function (res) {

                    var bufs = [];
                    res.on('data', function (data) {
                        bufs.push(new Buffer(data));
                        var status = new Buffer(data).toString();
                        console.log('# received', status);

                        var jsonData = JSON.parse(status);
                        connected = true;
                        if (jsonData.brew == 1 && relayStatus == false) {
                            console.log("Brewing...");
                            setBrew(true);
                            auto = setTimeout(function autoOff() {
                                pushBrew(false);
                                //setBrew(false);
                                console.log("Auto off");
                            }, 3600000);
                        } else if (jsonData.brew == 0) {
                            console.log("Stop Brewing...");
                            setBrew(false);
                            clearTimeout(auto);
                        }
                    });
                    res.on('end', function () {
                        console.log('done.');
                    })
                }).on('error', function (e) {
                    console.log('not ok -', e.message, 'error event')
                    connected = false;
                    if (override == 0) {
                        setBrew(false);
                    } else {
                        setBrew(true);
                    }
                });
            });
        }
    },5000);

brewSwitch.on ('change', function(time, type) {
    if (connected == true) {

    if (type == "rise") {
        console.log("Start brewing again");
        console.log("rise");
        brewOn();
    } else if (type == "fall") {
        console.log("fall");
        pushBrew(false);
    }
}
} );

    function pushBrew(brew){
        var brewVal;

        if(brew == true){
            brewVal = 1;
        }else{
            brewVal = 0;
        }

        setImmediate(function start () {
            request.post(
                'http://sgodbold.com:3000/coffee/status',
                { form: { brew: brewVal, time:new Date().toISOString()} },
                function (error, response, body) {
                    if (!error) {
                        console.log(body);
                    }else{
                        pushBrew(brew);
                    }
                }
            );
        });
    }


function brewOn(){
    setImmediate(function start () {
        request.post(
            'http://sgodbold.com:3000/coffee/instruction/create/now',
            { form: {} },
            function (error, response, body) {
                if (!error) {
                    //console.log(body);
                }else{
                    pushBrew(false);
                }
            }
        );
    });
}

    function setBrew(brew) {
        relayStatus = brew;
        if (brew == true) {
            relay.turnOn(1, function toggleTwoResult(err) {
                if (err) console.log("Err toggling 1", err);
            });
            statusPin.output(1);
            safe = setTimeout(function autoOff(){
                safeOff = true;
                //setBrew(false);
                console.log("Auto off");
            }, 3600000);
        } else {
            relay.turnOff(1, function toggleTwoResult(err) {
                if (err) console.log("Err toggling 1", err);
            });
            clearTimeout(safe);
            statusPin.output(0);
        }
    }
    console.log(myip());

//http.createServer(function (req, res) {
//    // res.writeHead(200, {'Content-type':'text/palin'});
//    console.log('Got a request!!!');
//    var status;
//    if (relayStatus == false) {
//        status = "Off";
//    } else {
//        status = "On";
//    }
//    if (req.url != "/" && (req.url == "/off?" || req.url == "/on?")) {
//        console.log(req.url);
//        if (req.url == "/on?") {
//            relay.turnOn(1, function toggleTwoResult(err) {
//                if (err) console.log("Err toggling 2", err);
//                relayStatus = false;
//            });
//            relayStatus = true;
//            status = "On";
//            res.end('<html>Current Coffee Status: ' + status +
//            '<form action="off"> <input type="submit" value="Toggle Coffee Status"/> </form>' +
//            '</html>');
//        } else if (req.url = "/off?") {
//            relay.turnOff(1, function toggleTwoResult(err) {
//                if (err) console.log("Err toggling 2", err);
//                relayStatus = true;
//            });
//            relayStatus = false;
//            status = "Off";
//            res.end('<html>Current Coffee Status: ' + status +
//            '<form action="on"> <input type="submit" value="Toggle Coffee Status"/> </form>' +
//            '</html>');
//        } else {
//            if (relayStatus == false) {
//                res.end('<html>Current Coffee Status: ' + status +
//                '<form action="on"> <input type="submit" value="Toggle Coffee Status"/> </form>' +
//                '</html>');
//            } else {
//                res.end('<html>Current Coffee Status: ' + status +
//                '<form action="off"> <input type="submit" value="Toggle Coffee Status"/> </form>' +
//                '</html>');
//            }
//        }
//    } else {
//
//        if (relayStatus == false) {
//            res.end('<html>Current Coffee Status: ' + status +
//            '<form action="on"> <input type="submit" value="Toggle Coffee Status"/> </form>' +
//            '</html>');
//        } else {
//            res.end('<html>Current Coffee Status: ' + status +
//            '<form action="off"> <input type="submit" value="Toggle Coffee Status"/> </form>' +
//            '</html>');
//        }
//    }
//}).listen(80);


//var gpio = tessel.port['GPIO']; // select the GPIO port
//gpio.digital['G3'].output(1);  // turn digital pin #1 high

//var ble = blelib.use(tessel.port['B']);
//var led2 = tessel.led[1].output(0); // Blue
//var interval;
//
//ble.on('ready', function(err) {
//    console.log('Making Discoverable...');
//    ble.startAdvertising();
//});
//
//ble.on('connect', function() {
//    led2 = tessel.led[1].output(1); //turn off our ble indicator
//    console.log("Connected!");
//    var value = 0;
//    interval = setInterval(function iteration() {
//        var str = "Interval #" + value++;
//        console.log("Writing out: ", str);
//
//        ble.writeLocalValue(0, new Buffer(str));
//    }, 1000);
//});
//
//ble.on('disconnect', function() {
//    console.log('Disconnected');
//    led2 = tessel.led[1].output(0); //turn off our ble indicator
//    clearInterval(interval);
//    ble.startAdvertising();
//});