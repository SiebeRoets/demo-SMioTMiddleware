var discoveryDriver=require('./drivers/discoveryDriver');
var webServer=require('./webServer')
var pl = require('tau-prolog');
var fs = require('fs');
const eventBus = require('./core/event-bus')
require( "tau-prolog/modules/lists" )( pl );
require( "tau-prolog/modules/js" )( pl );
require( "tau-prolog/modules/os" )( pl );
require( "./connector" )( pl, this );

// enable event-emitter to emit events to prolog
//read data from JSON
this.data=JSON.parse(fs.readFileSync('./configurations/assets.json'));
this.currID=12;
this.generateUUID =function generateUUID(){
    this.currID++
    return this.currID
}
var datacopy=this.data
var eventEmitter = eventBus;
var discover=new discoveryDriver(eventEmitter);
const webApp= new webServer(eventEmitter);
webApp.initServer();
this.addListener = function addListener(evt, fn){
    eventEmitter.addListener(evt, fn);
};
this.emitEvent=function (evt){
    eventEmitter.emit('app_event',evt);
}
eventEmitter.on('app_event',(arg)=>{
    console.log(JSON.stringify(arg));
    if(arg.data=="startDiscover"){
        sendDiscoverEvent();
    }
})
eventEmitter.on('testEvent',(arg)=>{
    console.log("device event gefired"+arg.name);
})
// emits event with random Id, random Type and a random Creator
function emitRandomEvent(){

    var randomId = Math.floor(Math.random() * 100);
    console.log(randomId);
    var eventTypes = ['action', 'update', 'query'];
    const randomEventType= eventTypes[Math.floor(Math.random() * eventTypes.length)];
    var creators = ['app', 'access_control', 'data_preprocessing'];
    const randomCreator= creators[Math.floor(Math.random() * creators.length)];
    eventEmitter.emit('new_event', {type:randomEventType, id:randomId, creator:randomCreator });
}

// emits an app_event of the type action
function emitAppEvent(){
  var d=new Date()
    var randomId = Math.floor(Math.random() * 100);
    console.log(randomId);
    eventEmitter.emit('app_event', {type:"action", id:randomId, creator:"jan", data:'found device',timestamp:d.toLocaleString() });
}

// emits event every 3 seconds
function startEmittingEvents(){
    //emitAppEvent()
    // emitRandomEvent();
    
    setTimeout(startEmittingEvents, 4000);
}
 function sendDiscoverEvent(){
    discover.findDrivers().then(
        ()=>{console.log("Done Searching")}
    ).catch(
        (err)=>{console.log("An error occured while search"+err)}
    );
    
}
//save configuration to JSON file
this.saveConfig=function (){
    const dataString = JSON.stringify(this.data, null, 2);
    // write JSON string to a file
    fs.writeFile('./configurations/assets.json', dataString, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
}



// run prolog program
var session = pl.create(10000);
session.consult("./main.pl", {
    success: function() {

        // print alle rules in sessie uit
        console.log(session.rules);
        console.log('test');

        // Query the goal
        session.query("init.", {
            success: function() {
                // Look for answers
                session.answers(answer=>
                        console.log(session.format_answer(answer)));       
                //startEmittingEvents();
                //sendDiscoverEvent();
            },
            error: function(err) {
                session.answers(x => console.log(pl.format_answer(x)));
            console.log(err); }

        });
    },
    error: function (err) { console.log(err);
        console.log(pl.format_answer(err))    }
});

