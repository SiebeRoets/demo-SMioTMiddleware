import{Device} from "./device";
import{RestDriver} from "../drivers/RESTdriver";
import { deviceParameter } from "./deviceParameter";
import { DeviceSettings } from "../drivers/interfaces";
import { Action } from "./action";
import { Engine } from "./engine";
import { HueDevice } from "./hue-device";
const EventBus= require("./event-bus");
var fs = require('fs');

export class HueHub extends Device{
  type:string 
  rest:RestDriver;
  api:any;
  connectedHueDevices:HueDevice[];
  lastAPIResponses:any; //cash previous api responses for later use
  constructor(engine:Engine,deviceId:number,name:string, platform: string, settings:DeviceSettings,owners:string[],type:string){
    super(engine,deviceId, name,platform, settings,owners);
    this.type=type;
    this.lastAPIResponses={};
    this.rest=this.engine.drivers["RestDriver"];
    const fullapi=JSON.parse(fs.readFileSync('../configurations/philips-hue-api.json'));
    this.api=fullapi.deviceAPIs["HueHub"];
  }
  //methods
  init(){
    this.api.forEach(param => {
      let devParam = new deviceParameter(param.parameterReference,param.parameterTypeInfo,param.actions);
      this.parameters[param.parameterReference]=devParam;
    });
  }
  connect(){
      //could add whole button press and get user auth key but out of scope...
      var reqs=this.parameters["getAllLights"].actions["Read"].commands.map((req)=>{
        //take copy of req template
        var copyreq=JSON.parse(JSON.stringify(req));
        var reqUrl=this.replaceValues(copyreq,undefined);
        return reqUrl;
      });
      this.rest.sendHTTPrequest(reqs).then(
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
  //add devices discoverd by the /lights command
  addHueDevice(id:string){
    this.lastAPIResponses["getAllLights"][id].name;
    var d=new Date();
    var settings={
      isConnected:this.lastAPIResponses["getAllLights"][id].state.reachable,
      lastSeen:d,
      state:undefined,
      addresses:undefined,
      ip:this.settings.ip,
      authID:this.settings.authID,
      hubID:this.deviceId
    }

    let newDev=new HueDevice(this.engine,
    this.engine.EventFactory.generateUUID(),
    this.lastAPIResponses["getAllLights"][id].name,
    "hue",
    settings,
    ["Jos"],
    "lamp"
    )
    this.engine.addDevice(newDev);

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
    var reqs=this.parameters[paramRef].actions["Read"].commands.map((req)=>{
      //take copy of req template
      var copyreq=JSON.parse(JSON.stringify(req));
      var reqUrl=this.replaceValues(copyreq,undefined);
      return reqUrl;
    });
    this.rest.sendHTTPrequest(reqs).then((result)=>{
      var data=this.handleResponse(result,this.parameters.paramRef.actions["Read"].interpreter);
      //details of this read request
      this.lastAPIResponses[paramRef]=result;
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
    let replacement=this.settings[val.replace(/(<|>)/g, '' )]
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
    
    switch(interpreter){
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
      type:this.type,
      name:this.name,
      owner:this.owners,
      settings:this.settings,
    };

  }
}