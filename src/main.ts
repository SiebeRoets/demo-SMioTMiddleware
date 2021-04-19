import { Engine } from "./core/engine";
import { HueHub } from "./core/hue-hub";
import {webServer} from "./webApp/webServer";

const EventBus= require("./core/event-bus");
EventBus.on("app_event",(evt)=>{
  console.log("FIREDDD"+JSON.stringify(evt))
  if(evt.update_parameter==="getAllLights"){
    //b.addHueDevice("1");
  }
})
let webApp=new webServer(EventBus);
webApp.initServer();
// var eng=new Engine();
// eng.readAssetFile();
// eng.prologEngine.run();
//const devices=eng.getDevices();
// var b=devices.find(boja => boja.deviceId === 69) as HueHub

//console.log(JSON.stringify(b.getParameters(),null,2));
//b.readParameter("getAllLights");
//b.addHueDevice("1");
//eng.saveAssetFile();
