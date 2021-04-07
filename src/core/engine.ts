import {EventFactory} from "./eventFactory";
import {RestDriver} from "../drivers/RESTdriver";
const EventBus= require("./event-bus");

export class Engine {
  // properties
  devices: Device[];
  assets: Asset[];
  drivers:any;
  prologEngine: PrologEngine;
  EventFactory: EventFactory;


  /**
   * @constructor
   */
  constructor() {
      this.devices = new Array();
      this.assets = new Array();
      this.addDrivers();
      this.EventFactory=new EventFactory();
      this.prologEngine = new PrologEngine(this);
  }
  private addDrivers() {
    this.drivers["RestDriver"]=new RestDriver();
    //this.drivers.push(new BLEDriver("v0.0"));
    //TODO
  }
  getDevices() {
    return this.devices
  }
  getAssets() {
    return this.prologEngine.getAssets();
  }
  addDevice(deviceConfig: DeviceConfiguration) {
    this.devices.push(new Device(deviceConfig, this));
}

  addAsset(asset: Asset) {
      this.assets.push(asset);
  }

  removeDevice(deviceId: string) {
      const device = this.devices.find(item => item.configurations.deviceId === deviceId);
      if (device != null) {
          this.devices.splice(this.devices.indexOf(device), 1);
      }
  }
  run() {
    this.prologEngine.run();
  }

}