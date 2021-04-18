import { Action } from "./action";
import { deviceParameter } from "./deviceParameter";
import {DeviceSettings} from '../drivers/interfaces';
import { Engine } from "./engine";

export abstract class Device {
  engine: Engine;
  name:string;
  deviceType:string //one of lamp iot-hub sensor....
  deviceId: number; //framework id
  platform: string; //e.g hue, arduino, polar...
  settings: DeviceSettings;
  owners:number[];
  parameters:any;//object with all parameters 

  
  constructor(engine:Engine,deviceId:number,name:string,devType:string, platform: string, settings:DeviceSettings,owners:number[]) {
    this.deviceType=devType;
    this.parameters={};
    this.name=name;
    this.engine=engine;
    this.deviceId = deviceId;
    this.platform = platform;
    this.settings=settings;
    this.owners=owners;
  }
  toString():string{
    const th={
    _uuid:this.deviceId,
    platform:this.platform,
    settings:this.settings,
    owners:this.owners
    }
    return JSON.stringify(th,null, 2)
  }
  paramsToString(){
    return JSON.stringify(this.parameters,null, 2)
  }
  abstract init();
  abstract connect();
  abstract disconnect();
  abstract getParameters();
  abstract readParameter(paramRef:string);
  abstract writeParameter(paramRef:string,data:any);
  abstract giveJSONformat();
}