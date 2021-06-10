import { Engine } from "./core/engine";
import { ESP32LightSens } from "./integrations/esp32-lightsensor";
import { HueDevice } from "./integrations/hue-device";
import { HueHub } from "./integrations/hue-hub";
import {webServer} from "./webApp/webServer";

const EventBus= require("./core/event-bus");
const appEventBus=require("./core/app-event-bus");
EventBus.on("device_event",(evt)=>{
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

function startEmittingEvents(e){
  emitUpdateEvt(e);
  //console.log(JSON.stringify(eng.prologEngine.systemState,null,2))
  setTimeout(()=>{startEmittingEvents(e)}, 5000);
}
var emitUpdateEvt= (eng)=>{
  /*var d=new Date()
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
  EventBus.emit("device_event",evt); */
  const devices=eng.getDevices();
  var b=devices.find(boja => boja.deviceId === 0) as HueDevice
  //b.checkConnection();
  var settings={
    creator:"JSFramework",
    subject:"lamp1",
    subjectID:0,
    origin_event:"N/A",
    update_parameter:"isConnected",
    update_data:false
  }
  var event=eng.EventFactory.createUpdateEvent(settings);
  EventBus.emit('connection_event',event);

  EventBus.emit('discovery_event',{
    type:"update",
    update_property:"new_device",
    network:"ip",
    id:224,
    data:{
      name:"wledjess",
      id:"nutteloos",
      device_type:"lamp",
      platfrom:"wled",
      ip_adress:"192.168.1.69"
    }
  })
  }
  startEmittingEvents(eng);
  


// const devices=eng.getDevices();
// var b=devices.find(boja => boja.deviceId === 1) as HueHub
//b.monitorParameter("illuminance");

//console.log(JSON.stringify(b.getParameters(),null,2));
//b.readParameter("getalllights");
//b.writeParameter("lightstatus","true");
//b.addHueDevice("1");
//eng.saveAssetFile();
