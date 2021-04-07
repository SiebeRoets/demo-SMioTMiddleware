import { Action } from "./action";
import { deviceParameter } from "./deviceParameter";
import {DeviceSettings} from '../drivers/interfaces';
import { Engine } from "./engine";

export abstract class Device {
  engine: Engine;
  deviceId: string; //framework id
  platform: string; //e.g hue, arduino, polar...
  settings: DeviceSettings;
  owners:Object;
  parameters:any;//object with all parameters 

  
  constructor(engine:Engine,deviceId:string, platform: string, settings:DeviceSettings,owners:Object) {
    this.engine=engine;
    this.deviceId = deviceId;
    this.platform = platform;
    this.settings=settings;
    this.owners=owners;
  }
  abstract init();
  abstract connect();
  abstract disconnect();
  abstract getParameters();
  abstract readParameter(paramRef:string);
  abstract writeParameter(paramRef:string);
}