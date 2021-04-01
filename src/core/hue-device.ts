import{Device} from "./device"
var fs = require('fs');

export class HueDevice extends Device{
  type:string //e.g lamp, sensor, hub,...
  constructor(deviceId:string, platform: string, settings:Object,owners:Object,type:string){
    super(deviceId, platform, settings,owners);
    this.type=type;
  }
  //methods
  connect(){
    if(this.type=="hub"){
      const api=JSON.parse(fs.readFileSync('../configurations/hue-hub-api.json'));

    }
  }
  abstract disconnect();
  abstract getParameters();
  abstract monitorParameter(paramRef:string);
  abstract readParameter(paramRef:string);
  abstract writeParameter(paramRef:string);
}