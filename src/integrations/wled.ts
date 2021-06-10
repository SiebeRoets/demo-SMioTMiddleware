import{Device} from "../core/device";
import{RestDriver} from "../drivers/RESTdriver";
import { deviceParameter } from "../core/deviceParameter";
import { DeviceSettings } from "../drivers/interfaces";
import { Action } from "../core/action";
import { Engine } from "../core/engine";
const EventBus= require("../core/event-bus");
const fullapi=require('./wled-api.json');


export class Wled extends Device{
  rest:RestDriver;
  api:any;
  constructor(engine:Engine,deviceId:number,devType:string,name:string, platform: string, settings:DeviceSettings,owners:number[],assets:number[]){
    super(engine,deviceId,devType, name,platform, settings,owners,assets);
    this.api=fullapi.deviceAPIs["WLED"];
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
    //not usefull
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
    var reqs=this.parameters[paramRef].actions["Read"].commands.map((req)=>{
      //take copy of req template
      var copyreq=JSON.parse(JSON.stringify(req));
      var reqUrl=this.replaceValues(copyreq,undefined);
      return reqUrl;
    });
    this.rest.sendHTTPrequest(reqs).then((result)=>{
      var data=this.handleResponse(result,this.parameters.paramRef.actions["Read"].interpreter);
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
    var reqs=this.parameters.paramRef.actions["Write"].commands.map((req)=>{
      //take copy of req template
      var copyreq=JSON.parse(JSON.stringify(req));
      var reqUrl=this.replaceValues(copyreq,data);
      return reqUrl;
    });
    this.rest.sendHTTPrequest(reqs).then((result)=>{
      var data=this.handleResponse(result,this.parameters.paramRef.actions["Write"].interpreter);
      console.log("the parameter setting: "+ data);
    })

    
  }
  //replace values in dummy url
 replaceValues(req: any, value: any) {
  //replace url values
  let matches=req.url.match(/<.*?>/g);
  matches.forEach((val)=>{
    let key=val.replace(/(<|>)/g, '' );
    let replacement=this.settings[key];
    req.url=req.url.replace(val,replacement);
  })
  //replace body values
  if(req.body!=undefined){
    matches=req.body.match(/<.*?>/g);
    matches.forEach((val)=>{
      req.body=req.body.replace(val,value);
    })
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
        break;
      case "8BitValue":
        //scale 0-255 to 0-100% range
        return scale(resp.state.bri,0,255,0,100);
        break;
    }
    
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