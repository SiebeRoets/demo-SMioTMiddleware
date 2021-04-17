import {EventFactory} from "./eventFactory";
import {RestDriver} from "../drivers/RESTdriver";
import { Device } from "./device";
import { Asset } from "./asset";
import { DeviceManager } from "./DeviceManager";
import { BLEDriver } from "../drivers/bledriver";
import { PrologEngine } from "./prologengine";
const EventBus= require("./event-bus");
const appEventEmitter=require("./app-event-bus");
var fs = require('fs');
const engineConf=require('../configurations/engine-config.json');
const assetFile=require('../configurations/assets.json');
export class Engine {
  // properties
  devices: Device[];
  assets: Asset[];
  drivers:any;
  prologEngine: PrologEngine;
  EventFactory: EventFactory;
  deviceManager: DeviceManager;
  /**
   * @constructor
   */
  constructor() {
      this.devices = new Array();
      this.assets = new Array();
      this.drivers={};
      this.addDrivers();
      this.deviceManager=new DeviceManager(this);
      this.EventFactory=new EventFactory(engineConf.currID);
      this.prologEngine = new PrologEngine(this);
  }
  private addDrivers() {
    this.drivers["RestDriver"]=new RestDriver();
    this.drivers["BLEDriver"]=new BLEDriver();
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
  deviceByID(deviceId:number):Device{
    var b=this.devices.find(dev => dev.deviceId === deviceId);
    if(b==undefined){
      console.log("No device found with given ID");
      
    }
    return b;

  }
  run() {
   // this.prologEngine.run();
  }
  quit(){
    this.saveAssetFile();
    const engineD={
      currID:this.EventFactory.currID
    }
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
    const dataString = JSON.stringify(file, null, 2);
    // write JSON string to a file
    fs.writeFile('./configurations/assets2.json', dataString, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });

    
  }
  printDevices(){
    this.devices.forEach((dev:Device)=>{
      console.log(dev.toString());
    })
  }
  readAssetFile(){
    var data=assetFile;
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
               asset.name,
               asset.type,
               asset.devices,
               asset.coupledAssets
             ))
          });
        }
    }
  }


}