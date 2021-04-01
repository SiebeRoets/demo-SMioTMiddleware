export abstract class Device {
  deviceId: string;
  platform: string; //e.g hue, arduino, polar...
  settings: Object;
  owners:Object;
  parameters:Object;
  
  constructor(deviceId:string, platform: string, settings:Object,owners:Object) {
    this.deviceId = deviceId;
    this.platform = platform;
    this.settings=settings;
    this.owners=owners;
  }
  abstract connect();
  abstract disconnect();
  abstract getParameters();
  abstract monitorParameter(paramRef:string);
  abstract readParameter(paramRef:string);
  abstract writeParameter(paramRef:string);


}