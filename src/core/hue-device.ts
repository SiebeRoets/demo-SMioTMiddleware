import{Device} from "./device";
import{RestDriver} from "../drivers/RESTdriver";
import { deviceParameter } from "./deviceParameter";
import { DeviceSettings } from "../drivers/interfaces";
import { Action } from "./action";
import { Engine } from "./engine";
const EventBus= require("./event-bus");
var fs = require('fs');

export class HueDevice extends Device{
  type:string //e.g lamp, sensor, hub,...
  rest:RestDriver;
  api:any;
  constructor(engine:Engine,deviceId:string,name:string, platform: string, settings:DeviceSettings,owners:Object,type:string){
    super(engine,deviceId, name,platform, settings,owners);
    this.type=type;
    this.rest=this.engine.drivers["RestDriver"];
    const fullapi=JSON.parse(fs.readFileSync('../configurations/philips-hue-api.json'));
    this.api=fullapi.deviceAPIs[this.type];
  }
  //methods
  init(){
    this.api.forEach(param => {
      let devParam = new deviceParameter(param.parameterReference,param.parameterTypeInfo,param.actions);
      this.parameters[param.parameterReference]=devParam;
    });
  }
  connect(){
    if(this.type=="HueHub"){
      
      //could add whole button press and get user auth key but out of scope...
      const action:Action=this.parameters.getAllLights.actions.Read;
      this.rest.sendHTTPrequest(action.commands, this).then(
        (results)=>{
          console.log(JSON.stringify(results));
          this.settings.isConnected=true;
          this.settings.lastSeen=new Date();
        }
      ).catch(
        (err)=>{
          console.log(err);
          //if no response was returned dev is not connected
          this.settings.isConnected=false;
        }
      )
    }
  }
  disconnect(){
    //not usefull
  }
  getParameters(){
    return this.parameters;
  }
  
  readParameter(paramRef:string){
    //validate
    if(this.parameters.paramRef==undefined){
      console.log("Parameter not found");
      return;
    }
    this.rest.sendHTTPrequest(this.parameters.paramRef.actions["Read"].commands, this).then((result)=>{
      var data=this.handleResponse(result,this.parameters.paramRef.actions["Read"].interpreter);
      //details of this read request
      var settings={
        creator:"JSFramework",
        subject:this.name,
        origin_event:"N/A",
        update_parameter:paramRef,
        update_data:data,
      }
      var event=this.engine.EventFactory.createUpdateEvent(settings);
      //send on bus
      EventBus.emit('framework_event',event);
    }
    )
  }
  writeParameter(paramRef:string,data:any){
    if(this.parameters.paramRef==undefined){
      console.log("Parameter not found");
      return;
    }
    
  }
  //interpret the JSON payload of Hue responses
  handleResponse(resp:any,interpreter:string){
    const scale = (num, in_min, in_max, out_min, out_max) => {
      return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
    switch(interpreter){
      case "stateOnOff":
        return resp.state.on ? "on" : "off";
      case "8BitValue":
        //scale 0-255 to 0-100% range
        return scale(resp.state.bri,0,255,0,100);
      case "connectedLights":
        //filter usefull info
        let lights={};
        for(var key in resp){
          // skip loop if the property is from prototype
          if (!resp.hasOwnProperty(key)) continue;
            lights[key]={
              reachable:resp[key].state.reachable,
              modelNumber:resp[key].modelid,
              type:resp[key].type,
              name:resp[key].name
            }
        }
        return lights;

    }
    
  }
}