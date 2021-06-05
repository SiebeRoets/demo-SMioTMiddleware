import{Device} from "../core/device";
import { deviceParameter } from "../core/deviceParameter";
import { DeviceSettings } from "../drivers/interfaces";
import { Action } from "../core/action";
import { Engine } from "../core/engine";
import { BLEDriver } from "../drivers/bledriver";
const EventBus= require("../core/event-bus");
const fullapi=require('./esp32-lightsensor-api.json');


export class ESP32LightSens extends Device{
  ble:BLEDriver;
  api:any;
  constructor(engine:Engine,deviceId:number,devType:string,name:string, platform: string, settings:DeviceSettings,owners:number[],assets:number[]){
    super(engine,deviceId,devType, name,platform, settings,owners,assets);
    this.ble=this.engine.drivers["BLEDriver"];
    this.api=fullapi.deviceAPIs["LightSensor"];;
    this.init();
  }
  //methods
  init(){
    this.api.forEach(param => {
      let devParam = new deviceParameter(param.parameterReference,param.parameterTypeInfo,param.actions);
      this.parameters[param.parameterReference]=devParam;
    });
  }
  connect(){

  }
  disconnect(){
  }
  getParameters(){
    return this.parameters;
  }
  
  readParameter(paramRef:string){
    //not applicable
  }
  writeParameter(paramRef:string,data:any){
    //not applicabler
  }
  monitorParameter(paramRef:string){
    var monitorsettings={
      mac:this.settings.mac,
      id:this.deviceId,
      serviceUUID:this.parameters[paramRef].actions.monitor.serviceUUID,
      characteristicUUID:this.parameters[paramRef].actions.monitor.characteristic
    }
    this.ble.performMonitor(monitorsettings);
    //subscribe to incomming bleevents.
    EventBus.on('ble_event',(evt)=>{
      if(evt.subjectID==this.deviceId){
        var settings={
          creator:"JSFramework",
          subject:this.name,
          subjectID:this.deviceId,
          origin_event:"N/A",
          update_parameter:evt.update_parameter,
          update_data:evt.update_data
        }
        console.log("settings are "+ JSON.stringify(settings));
        var event=this.engine.EventFactory.createUpdateEvent(settings);
        EventBus.emit('device_event',event);
      }
    });
  }
  giveJSONformat(){
    var obj={
      __uuid:this.deviceId,
      platform:this.platform,
      name:this.name,
      owner:this.owners,
      settings:this.settings,
      
    };
    return obj;
  }
}