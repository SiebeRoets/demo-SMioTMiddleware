var noble = require('noble');
const suppDrivers = require('../configurations/supported-drivers.json')
const eventBus= require("../core/event-bus");
export class BLEDriver {
  type:string
  version:string
  constructor(){
    this.type="bledriver";
    this.version="v0.1";
  }
  init(){
    noble.on('discover', (peripheral)=> {
      if(peripheral.advertisement.localName!=undefined){
        console.log('the name is: ' + peripheral.advertisement.localName)
        this.onDiscover(peripheral);
      }
    });
    noble.on('warning', (warning)=>{
      console.log("there is an error");
    });
    
  }
  discoverDevices(){
    noble.on('stateChange', (state)=> {
      if (state === 'poweredOn') {
        noble.startScanning();
      } else {
        noble.stopScanning();
      }
    });
    //stop automatically after 1 minute
    setTimeout(noble.stopScanning, 10000);
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
          address:peripheral.address,
          serviceUUID:peripheral.advertisement.serviceUuids,
          rssi:peripheral.rssi
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