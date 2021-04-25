import { Engine } from "./core/engine";
import { HueHub } from "./core/hue-hub";
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
// eng.readAssetFile();
eng.prologEngine.run();
//const devices=eng.getDevices();
// var b=devices.find(boja => boja.deviceId === 69) as HueHub

//console.log(JSON.stringify(b.getParameters(),null,2));
//b.readParameter("getAllLights");
//b.addHueDevice("1");
//eng.saveAssetFile();
