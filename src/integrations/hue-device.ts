import{Device} from "../core/device";
import{RestDriver} from "../drivers/RESTdriver";
import { deviceParameter } from "../core/deviceParameter";
import { DeviceSettings } from "../drivers/interfaces";
import { Action } from "../core/action";
import { Engine } from "../core/engine";
import { HueHub } from "./hue-hub";
const EventBus= require("../core/event-bus");
const fullapi=require('./philips-hue-api.json');


export class HueDevice extends Device{
  type:string; //e.g HueLamp, HueSensor,...
  rest:RestDriver;
  api:any;
  hub:HueHub;
  constructor(engine:Engine,deviceId:number,devType:string,name:string, platform: string, settings:DeviceSettings,owners:number[],assets:number[],type:string){
    super(engine,deviceId,devType, name,platform, settings,owners,assets);
    this.type=type;
    this.rest=this.engine.drivers["RestDriver"];
    this.api=fullapi.deviceAPIs[this.type];
    this.init();
  }
  //methods
  init(){
    this.api.forEach(param => {
      let devParam = new deviceParameter(param.parameterReference,param.parameterTypeInfo,param.actions);
      this.parameters[param.parameterReference]=devParam;
    });
    //TODO hub now has to be defined before lamps
    this.hub=this.engine.deviceByID(this.settings.hubDeviceId) as HueHub
    //Listen for hub responses to verify connection
    EventBus.on("device_event", (evt)=>{
      if(evt.data.parameter=="getalllights"){
        var reachable=evt.data.value[this.settings.IdOnHub].reachable;
        //console.log("PREVIOUS STATE IS " + this.settings.isConnected+" NOW: "+reachable);
        if(this.settings.isConnected!=reachable){
          console.log("GOTTA SEND CONNECTION EVENT");
          var settings={
            creator:"JSFramework",
            subject:this.name,
            subjectID:this.deviceId,
            origin_event:"N/A",
            update_parameter:"isConnected",
            update_data:reachable
          }
          var event=this.engine.EventFactory.createUpdateEvent(settings);
          EventBus.emit('connection_event',event);
        }
        this.settings.isConnected=reachable;
      }
    });
  }
  connect(){
      //implement connect to hub protocol
  }
  checkConnection(){
    this.hub.readParameter("getalllights");
  }
  disconnect(){
    //not usefull
  }
  getParameters(){
    return this.parameters;
  }

  
  readParameter(paramRef:string){
    //validate
    if(this.parameters[paramRef]==undefined){
      console.log("Parameter not found");
      return;
    }
    this.checkConnection();
    if(!this.settings.isConnected){
      console.log("Device is not connected");
      return;
    }
    var reqs=this.parameters[paramRef].actions["Read"].commands.map((req)=>{
      //take copy of req template
      console.log("request url is : " + JSON.stringify(req))
      var copyreq=JSON.parse(JSON.stringify(req));
      var reqUrl=this.replaceValues(copyreq,undefined);
      
      return reqUrl;
    });
    this.rest.sendHTTPrequest(reqs).then((result)=>{
      var parsedResult=JSON.parse(result[0])
      var data=this.handleResponse(parsedResult,this.parameters[paramRef].actions["Read"].interpreter);
      //details of this read request
      var settings={
        creator:"JSFramework",
        subject:this.name,
        subjectID:this.deviceId,
        origin_event:"N/A",
        update_parameter:paramRef,
        update_data:data,
      }
      var event=this.engine.EventFactory.createUpdateEvent(settings);
      //send on bus
      EventBus.emit('device_event',event);
    }
    )
  }
  writeParameter(paramRef:string,data:any){
    if(this.parameters[paramRef]==undefined){
      console.log("Parameter not found");
      return;
    }
    var parsedData=this.handleWrite(data,this.parameters[paramRef].actions["Read"].interpreter)
    var reqs=this.parameters[paramRef].actions["Write"].commands.map((req)=>{
      //take copy of req template
      var copyreq=JSON.parse(JSON.stringify(req));
      var reqUrl=this.replaceValues(copyreq,parsedData);
      return reqUrl;
    });
    this.rest.sendHTTPrequest(reqs).then((result)=>{
      var data=this.handleResponse(result,this.parameters[paramRef].actions["Write"].interpreter);
      console.log("the parameter setting: "+ data);
      this.readParameter(paramRef);
    })
  }
  //replace values in dummy url
 replaceValues(req: any, value: any) {
  //replace url values
  let matches=req.url.match(/<.*?>/g);
  matches.forEach((val)=>{
    let key=val.replace(/(<|>)/g, '' );
    let replacement=this.settings[key];
    //if setting is not found localy than search in hue hub
    if (replacement==undefined){
      replacement=this.hub.settings[key];
    }
    req.url=req.url.replace(val,replacement);
  })
  //replace body values
  if(req.body!=undefined){
    matches=req.body.match(/<.*?>/g);
    matches.forEach((val)=>{
      req.body=req.body.replace(val,value);
    })
  }
  return req;
}
  //translate value to a value of Hue API
  handleWrite(value:any,interpreter:string){
    switch(interpreter){
      case "stateOnOff":
        
        return (value=="on") ? "true" : "false";
        break;
    }
  }
  
  //interpret the JSON payload of Hue responses
  handleResponse(resp:any,interpreter:string){
    const scale = (num, in_min, in_max, out_min, out_max) => {
      return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
    console.log("interpreter is: "+interpreter);
    switch(interpreter){
      case "stateOnOff":
        console.log("state is: "+resp.state.on)
        return resp.state.on ? "on" : "off";
        break;
      case "8BitValue":
        //scale 0-255 to 0-100% range
        return scale(resp.state.bri,0,255,0,100);
        break;
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
        break;
      case "parameterSet":
        var fail=false;
        resp.forEach(element => {
          if(element.success==undefined){
            fail=true;
          }
        });
        return fail ? "success" : "failed";
    }
    
  }
  giveJSONformat(){
    var obj={
      __uuid:this.deviceId,
      platform:this.platform,
      type:this.type,
      name:this.name,
      owner:this.owners,
      settings:this.settings,
      
    };
    return obj;

  }
}