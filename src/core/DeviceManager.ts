import { Device } from "./device";
import { Engine } from "./engine";
import { HueDevice } from "./hue-device";
import { HueHub } from "./hue-hub";

//use systemJS to load modules dynamically + loading from server... per platform eg hue arduino polar...
export class DeviceManager{
  engine: Engine
  constructor(engine:Engine){
    this.engine=engine;
  }
  createDevice(devSettings:any):Device{
    switch(devSettings.platform){
      case "hue": 
        switch(devSettings.type){
          case "HueHub":
              return new HueHub(this.engine,
              devSettings.__uuid,
              devSettings.name,
              "hue",
              devSettings.settings,
              devSettings.owners,
              devSettings.type
              );
              break;
          case "HueLamp":
              return new HueDevice(this.engine,
              devSettings.__uuid,
              devSettings.name,
              "hue",
              devSettings.settings,
              devSettings.owners,
              devSettings.type
              );
        }
        break;
      case "arduino":
        
    }
    return undefined;
  }

}