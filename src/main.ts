import { Engine } from "./core/engine";
const EventBus= require("./core/event-bus");

EventBus.on("framework_event",(evt)=>{
  console.log("FIREDDD"+JSON.stringify(evt))
})
var eng=new Engine();
eng.readAssetFile();

const devices=eng.getDevices();
var b=devices.find(x => x.deviceId === 1)
//console.log(JSON.stringify(b.getParameters(),null,2));
b.readParameter("getAllLights");