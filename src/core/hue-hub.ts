import{Device} from "./device";
import{RestDriver} from "../drivers/RESTdriver";
import { deviceParameter } from "./deviceParameter";
import { DeviceSettings } from "../drivers/interfaces";
import { Action } from "./action";
import { Engine } from "./engine";
import { HueDevice } from "./hue-device";
const EventBus= require("./event-bus");
const fullapi=require('../configurations/philips-hue-api.json');
export class HueHub extends Device{
  type:string ;
  rest:RestDriver;
  api:any;
  connectedHueDevices:HueDevice[];
  lastAPIResponses:any; //cash previous api responses for later use
  constructor(engine:Engine,deviceId:number,devType:string,name:string, platform: string, settings:DeviceSettings,owners:number[],type:string){
    super(engine,deviceId,devType, name,platform, settings,owners);
    this.type=type;
    this.lastAPIResponses={};
    this.rest=this.engine.drivers["RestDriver"];
    this.api=fullapi.deviceAPIs["HueHub"];
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
    var d=new Date();
    var settings={
      isConnected:this.lastAPIResponses["getAllLights"][id].state.reachable,
      lastSeen:d,
      state:undefined,
      addresses:undefined,
      ip:undefined,
      authID:undefined,
      IdOnHub:id,
      hubDeviceId:this.deviceId
    }

    let newDev=new HueDevice(this.engine,
    this.engine.EventFactory.generateUUID(),
    this.lastAPIResponses["getAllLights"][id].name,
    "lamp",
    "hue",
    settings,
    [10],
    "HueLamp"
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
    if(this.parameters[paramRef]==undefined){
      console.log("Parameter not found");
      return;
    }
    var reqs=this.parameters[paramRef].actions["Read"].commands.map((req)=>{
      //take copy of req template
      var copyreq=JSON.parse(JSON.stringify(req));
      this.replaceValues(copyreq,undefined);
      return copyreq;
    });
    const driver=this.parameters[paramRef].actions["Read"].driver;
    this.engine.drivers[driver].sendHTTPrequest(reqs).then((results:string[])=>{
      var data=this.handleResponse(results,this.parameters[paramRef].actions["Read"].interpreter);
      //details of this read request
      this.lastAPIResponses[paramRef]=JSON.parse(results[0]);
      console.log("data is "+this.name+ JSON.stringify(data));
      var settings={
        creator:"JSFramework",
        subject:this.name,
        origin_event:"N/A",
        update_parameter:paramRef,
        update_data:data
      }
      console.log("settings are "+ JSON.stringify(settings));
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
    this.rest.sendHTTPrequest(reqs).then((results:string[])=>{
      var data=this.handleResponse(results,this.parameters.paramRef.actions["Write"].interpreter);
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
  handleResponse(respString:string[],interpreter:string){
    console.log("interpreter: " +interpreter)
    switch(interpreter){
      case "connectedLights":
        let resp=JSON.parse(respString[0]);
        console.log(JSON.stringify(resp,null,2))
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
      platform:"hue",
      type:this.type,
      name:this.name,
      owner:this.owners,
      settings:this.settings,
    };
    return obj;
  }
}