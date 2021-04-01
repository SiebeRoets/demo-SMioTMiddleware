import { EventEmitter } from "events";
const mDnsSd = require('node-dns-sd');
const suppDrivers = require('../configurations/supported-drivers.json')



const authUser ="8B2yeLhSJd9pwpRdXvHNijnodkdwRwA3KvhXolRA"
 class discoveryDriver {
  status:String;
  NetworkDevices: Array<Object>;
  BluetoothDevices: any;
  eventEmitter:EventEmitter;
  constructor(emitter){
    this.status="Scanning";
    this.NetworkDevices=[];
    this.BluetoothDevices=[];
    this.eventEmitter=emitter;
  }  

  findDrivers(){
    return suppDrivers.reduce((seq,n) =>{
      return seq.then((deviceList)=>{
        if(deviceList!=undefined){
        deviceList.forEach(device =>{
          var thisName=(device.modelName==null)?device.fqdn:device.modelName;
          var thisSerialNumber=this.filterSerialNumber(thisName,n.idDevider);
          console.log("found name "+thisName+" at adress "+device.address )
          this.eventEmitter.emit('discovery_event',{
            type:"update",
            update_property:"discovery",
            state:"new_device",
            id:224,
            data:{
              name:thisName,
              id:thisSerialNumber,
              deviceBrand:"Philips Hue Bridge",
              ipAdress:device.address
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
          var thisName=(device.modelName==null)?device.fqdn:device.modelName;
          var thisSerialNumber=this.filterSerialNumber(thisName,suppDrivers[suppDrivers.length-1].idDevider);
          console.log("found name "+thisName+" at adress "+device.address )
          this.eventEmitter.emit('discovery_event',{
            type:"update",
            update_property:"discovery",
            state:"new_device",
            id:224,
            data:{
              name:thisName,
              id:thisSerialNumber,
              ipAdress:device.address
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
  
}
module.exports = discoveryDriver;
