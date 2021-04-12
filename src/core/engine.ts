import {EventFactory} from "./eventFactory";
import {RestDriver} from "../drivers/RESTdriver";
import { Device } from "./device";
import { Asset } from "./asset";
import { DeviceManager } from "./DeviceManager";
const EventBus= require("./event-bus");
var fs = require('fs');

export class Engine {
  // properties
  devices: Device[];
  assets: Asset[];
  drivers:any;
  //prologEngine: PrologEngine;
  EventFactory: EventFactory;
  deviceManager: DeviceManager;
  /**
   * @constructor
   */
  constructor() {

      this.devices = new Array();
      this.assets = new Array();
      this.addDrivers();
      this.deviceManager=new DeviceManager(this);
      this.EventFactory=new EventFactory();
   //   this.prologEngine = new PrologEngine(this);
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
  //  return this.prologEngine.getAssets();
  }
  addDevice(device: Device) {
    this.devices.push(device);
}


  addAsset(asset: Asset) {
      this.assets.push(asset);

  }

  removeDevice(deviceId: number) {
      const device = this.devices.find(item => item.deviceId === deviceId);
      if (device != null) {
          this.devices.splice(this.devices.indexOf(device), 1);
      }
  }
  run() {
   // this.prologEngine.run();
  }
  saveAssetFile(){
    //TODO update only neccecary items...
    var file={};
    file["device"]=[];
    this.devices.forEach((device:Device)=>{
      file["device"].push(device.giveJSONformat());
    })
    this.assets.forEach((asset:Asset)=>{
      if(file[asset.type]==undefined){
        //create subgroup
        file[asset.type]=[];
      }
      file[asset.type].push(asset.giveJSONformat());
    })

    
  }
  readAssetFile(){
    var data=JSON.parse(fs.readFileSync('../configurations/assets.json'));
    for(var key in data){
      // skip loop if the property is from prototype
      if (!data.hasOwnProperty(key)) continue;
        if(key=="device"){
          data[key].forEach((device) => {
            //add devices from data
            this.devices.push(this.deviceManager.createDevice(device));
          });
        }
        else{
          data[key].forEach(asset => {
             this.assets.push(new Asset(
               asset.__uuid,
               asset.type,
               asset.devices,
               asset.coupledAssets
             ))
          });
        }
    }
  }


}