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
    noble.on('discover', (peripheral)=> {
      if(peripheral.advertisement.localName!=undefined){
        console.log('the name is: ' + peripheral.advertisement.localName)
        this.onDiscover(peripheral);
      }
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
  sendToBus(settings,data){
    //send raw data to device
    var evt={
      subjectID:settings.id,
      origin_event:"N/A",
      update_parameter:settings.parameter,
      update_data:data
    }
    eventBus.emit("ble_event",evt);
  }
  performMonitor(settings){
    this.discoverDevices();
    noble.on('discover',  (peripheral) =>{
      var mac = peripheral.address;
      if (mac.localeCompare(settings.mac) == 0) {
          noble.stopScanning();
          peripheral.connect((error) => {
              if (error) {
                  console.log("error occurred:", error.message);
              }
              peripheral.discoverServices([],(error, services) =>{
                  if (error) {
                      console.log("error occurred:", error.message);
                  }
                  var correctservice
                  services.forEach(function(service) {
                    console.log("looking for service: "+settings.serviceUUID);
                    if(service.uuid==settings.serviceUUID){
                      correctservice=service;
                    }
                  });
                  correctservice.discoverCharacteristics([], (error, characteristics) =>{
                      if (error) {
                          console.log("error occurred:", error.message);
                      }
                      var correctchar
                      characteristics.forEach(function(char) {
                        if(char.uuid==settings.characteristicUUID){
                          correctchar=char;
                        }
                      })
                      correctchar.on('data', (data, isNotification)=> {
                        var val=data.toString('ascii');
                          this.sendToBus(settings,val);
                      });
                      correctchar.subscribe(error => {
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