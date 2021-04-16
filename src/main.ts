import { Engine } from "./core/engine";
import { HueHub } from "./core/hue-hub";
const EventBus= require("./core/event-bus");

EventBus.on("framework_event",(evt)=>{
  console.log("FIREDDD"+JSON.stringify(evt))
  if(evt.update_parameter==="getAllLights"){
    b.addHueDevice("1");
    eng.saveAssetFile();
  }
})
var eng=new Engine();
eng.readAssetFile();

const devices=eng.getDevices();
var b=devices.find(boja => boja.deviceId === 1) as HueHub
//console.log(JSON.stringify(b.getParameters(),null,2));
b.readParameter("getAllLights");
//b.addHueDevice("1");
//eng.saveAssetFile();