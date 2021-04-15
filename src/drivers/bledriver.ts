var noble = require('noble');
const suppDrivers = require('../configurations/supported-drivers.json')
const EventBus= require("./event-bus");

export class BLEDriver {
  type:string
  version:string
  constructor(){
    this.type="bledriver";
    this.version="v0.1";
    noble.state="poweredOn";
  }
  init(){
    noble.on('discover', function(peripheral) {
      console.log('discovered bluetooth device');
    });
    noble.on('warning', function(message){
      this.onError(message)
    });
    
  }
  discoverDevices(){
    noble.startScanning();
    //stop automatically after 1 minute
    setTimeout(noble.stopScanning(), 60000);
  }
  onDiscover(peripheral){
    var evt={
      type:"update",
      update_property:"discovery",
      state:"new_device",
      network:"ble",
      id:224,
      data:{
        name:peripheral.advertisement.localName,
        id:peripheral.id,
        deviceBrand:"generic BLE",
        address:peripheral.address
      }
    }
    //check if is in list of supported drivers
    suppDrivers.ble.forEach((e) => {
      if(peripheral.advertisement.localName.includes(e.name)){
        evt.data.deviceBrand=e.name;
      }
    });
    eventBus.emit('discovery_event',evt);
  }
  onError(err){
    //send error event
  }

}