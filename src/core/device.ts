import { Action } from "./action";
import { deviceParameter } from "./deviceParameter";
import {DeviceSettings} from '../drivers/interfaces';
import { Engine } from "./engine";

export abstract class Device {
  engine: Engine;
  name:string;
  deviceId: number; //framework id
  platform: string; //e.g hue, arduino, polar...
  settings: DeviceSettings;
  owners:number[];
  parameters:any;//object with all parameters 

  
  constructor(engine:Engine,deviceId:number,name:string, platform: string, settings:DeviceSettings,owners:number[]) {
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
  abstract init();
  abstract connect();
  abstract disconnect();
  abstract getParameters();
  abstract readParameter(paramRef:string);
  abstract writeParameter(paramRef:string,data:any);
  abstract giveJSONformat();
}