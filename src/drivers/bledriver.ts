import { Engine } from "../core/engine";

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
    
    noble.on('warning', (warning)=>{
      console.log("there is an error");
    });
    
  }
  discoverDevices(){
    noble.on('discover', (peripheral)=> {
      if(peripheral.advertisement.localName!=undefined){
        console.log('the name is: ' + peripheral.advertisement.localName)
        this.onDiscover(peripheral);
      }
    });
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
  sendToEventBus(settings,data){
    //send raw data to device
    var evt={
      subjectID:settings.id,
      origin_event:"N/A",
      update_parameter:settings.paramater,
      update_data:data
    }
    eventBus.emit("ble_event",evt);
  }
  performMonitor(settings){
    this.discoverDevices();
    noble.on('discover', function (peripheral) {
      var mac = peripheral.address;
      if (mac.localeCompare(settings.mac) == 0) {
          noble.stopScanning();
          peripheral.connect(function (error) {
              if (error) {
                  console.log("error occurred:", error.message);
              }
              peripheral.discoverServices([], function (error, services) {
                  if (error) {
                      console.log("error occurred:", error.message);
                  }
                  services.forEach(function(service) {
                    console.log('found service:', service.uuid);
                  });
                  console.log("length of services is"+services.length)
                  var service = services[2];
                  service.discoverCharacteristics([], function (error, characteristics) {
                      if (error) {
                          console.log("error occurred:", error.message);
                      }
                      characteristics.forEach(function(char) {
                        console.log('found characteristic:', char.uuid);
                      })
                      characteristics[0].on('data', function (data, isNotification) {
                          console.log("Current light is: "+ JSON.stringify(data))
                          this.sendToEventbus(settings,data);
                      });
                      characteristics[0].subscribe(error => {
                        if (error) {
                          console.error('Error subscribing to echoCharacteristic');
                        } else {
                          console.log('Subscribed for echoCharacteristic notifications');
                        }
                      });
                  });
              });
          });
      }
    });
}
}