import { Engine } from "./core/engine";
import { HueHub } from "./integrations/hue-hub";
import {webServer} from "./webApp/webServer";

const EventBus= require("./core/event-bus");
const appEventBus=require("./core/app-event-bus");
EventBus.on("framework_event",(evt)=>{
  console.log("framework event bus: "+JSON.stringify(evt))
  if(evt.update_parameter==="getAllLights"){
    //b.addHueDevice("1");
  }
})
appEventBus.on("app_event",(evt)=>{
  console.log("APP event bus: "+JSON.stringify(evt))
})
appEventBus.on("toApp_event",(evt)=>{
  console.log("to APP event bus: "+JSON.stringify(evt))
})



var eng=new Engine();
eng.readAssetFile();
eng.run();

function startEmittingEvents(){
  emitUpdateEvt();
  console.log(JSON.stringify(eng.prologEngine.systemState,null,2))
  setTimeout(startEmittingEvents, 4000);
}
function emitUpdateEvt(){
  console.log("emiting event")
  var d=new Date()
  var evt={
    type: 'update',
    id: 55688,
    creation_time: d.toLocaleString(),
    creator: 'lamp1__0',
    subject: 'lamp1__0',
    update_property: 'parameter',
    data:{
      parameter:"brightness",
      value:58
    }
  }
  EventBus.emit("device_event",evt);  
  }
  startEmittingEvents()
//const devices=eng.getDevices();
// var b=devices.find(boja => boja.deviceId === 69) as HueHub

//console.log(JSON.stringify(b.getParameters(),null,2));
//b.readParameter("getAllLights");
//b.addHueDevice("1");
//eng.saveAssetFile();
