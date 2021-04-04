import{Device} from "./device";
import{RestDriver} from "../drivers/RESTdriver";
import { deviceParameter } from "./deviceParameter";
import { DeviceSettings } from "../drivers/interfaces";
var fs = require('fs');

export class HueDevice extends Device{
  type:string //e.g lamp, sensor, hub,...
  rest:RestDriver;
  api:any;
  constructor(deviceId:string, platform: string, settings:DeviceSettings,owners:Object,type:string){
    super(deviceId, platform, settings,owners);
    this.type=type;
    this.rest=new RestDriver();
    const fullapi=JSON.parse(fs.readFileSync('../configurations/philips-hue-api.json'));
    this.api=fullapi.deviceAPIs[this.type];
  }
  //methods
  init(){
    this.api.array.forEach(param => {
      let devParam = new deviceParameter(this.api.parameterReference,this.api.parameterTypeInfo,this.api.actions);
      this.parameters.push(devParam);
    });
  }
  connect(){
    if(this.type=="HueHub"){
      
      //could add whole button press and get user auth key...
      this.rest.sendHTTPrequest(this.parameters., this).then(
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
    
  }
  
  abstract monitorParameter(paramRef:string);
  abstract readParameter(paramRef:string);
  abstract writeParameter(paramRef:string);
}