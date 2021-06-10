import { EventEmitter } from "events";
const mDnsSd = require('node-dns-sd');
const suppDrivers = require('../configurations/supported-drivers.json')
const EventBus= require("../core/event-bus");


 export class DiscoveryDriver {
  status:String;
  busy:boolean;
  NetworkDevices: Array<Object>;
  BluetoothDevices: any;
  eventEmitter:EventEmitter;
  constructor(){
    this.status="Scanning";
    this.NetworkDevices=[];
    this.BluetoothDevices=[];
    this.busy=false;
    //subscribe to events
    EventBus.on('framework_event',(evt)=>{
      console.log("going to start a discovery")
      if(evt.type=="action"&&evt.action_property=="start_discover"&&!this.busy){
        console.log("starting search");
        this.busy=true;
        this.findDrivers().then(
          ()=>{console.log("Done Searching"); this.busy=false;}
      ).catch(
          (err)=>{console.log("An error occured while search"+err)}
      );
      }
    })
  }  

  findDrivers(){
    return suppDrivers.ip.reduce((seq,n) =>{
      return seq.then((deviceList)=>{
        if(deviceList!=undefined){
        deviceList.forEach(device =>{
          //console.log(JSON.stringify(device));
          var thisName=(device.modelName==null)?device.fqdn:device.modelName;
          var thisSerialNumber=this.filterSerialNumber(thisName,n.idDevider);
          var devInfo=this.giveDeviceInfo(device.fqdn);
          console.log(" found name "+thisName+" at adress "+device.address )
          EventBus.emit('discovery_event',{
            type:"update",
            update_property:"new_device",
            network:"ip",
            id:224,
            data:{
              name:thisName,
              id:thisSerialNumber,
              device_type:devInfo.deviceType,
              platform:devInfo.platform,
              ip_address:device.address
            }
          })
        })
      }
        return mDnsSd.discover({name: n.service[0]})
      })
    },Promise.resolve()).then(
      (deviceList)=>{
        if(deviceList!=undefined){
        deviceList.forEach(device =>{
                    console.log(JSON.stringify(device,null,2));
          var thisName=(device.modelName==null)?device.fqdn:device.modelName;
          var thisSerialNumber=this.filterSerialNumber(thisName,suppDrivers.ip[suppDrivers.ip.length-1].idDevider);
          var devInfo=this.giveDeviceInfo(device.fqdn);
          console.log(" found name "+thisName+" at adress "+device.address )
          EventBus.emit('discovery_event',{
            type:"update",
            update_property:"new_device",
            id:224,
            data:{
              name:thisName,
              id:thisSerialNumber,
              device_type:devInfo.deviceType,
              platform:devInfo.platform,
              ip_address:device.address
            }
          })
        })
      }
    }
    )
    }
  filterSerialNumber(fullName:string,split:string){
    var end=(fullName.indexOf(".")==-1)?fullName.length:fullName.indexOf(".")
  return fullName.substring((fullName.indexOf(split)+split.length),end);
  }
  giveDeviceInfo(fqdn:string){
    for(var i=0;i<suppDrivers.ip.length;i++){
      if(fqdn.includes(suppDrivers.ip[i].service[0])){
        let info={
          deviceType:suppDrivers.ip[i].deviceType,
          platform:suppDrivers.ip[i].platform
        }
        return info;
      }
    }
  }
  
}
