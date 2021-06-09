import { Device } from "./device";
import { Engine } from "./engine";
import { ESP32LightSens } from "../integrations/esp32-lightsensor";
import { HueDevice } from "../integrations/hue-device";
import { HueHub } from "../integrations/hue-hub";
import { Wled } from "../integrations/wled";
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
              devSettings.deviceType,
              "hue",
              devSettings.settings,
              devSettings.owners,
              devSettings.coupledAssets,
              devSettings.type
              );
              break;
          case "HueLamp":
              return new HueDevice(this.engine,
              devSettings.__uuid,
              devSettings.name,
              devSettings.deviceType,
              "hue",
              devSettings.settings,
              devSettings.owners,
              devSettings.coupledAssets,
              devSettings.type
              );
        }
        break;
      case "wled":
              return new Wled(this.engine,
                devSettings.__uuid,
              devSettings.name,
              devSettings.deviceType,
              "wled",
              devSettings.settings,
              devSettings.owners,
              devSettings.coupledAssets,
              );
      case "ESP32LightSens":
        return new ESP32LightSens(
          this.engine,
          devSettings.__uuid,
          devSettings.name,
          devSettings.deviceType,
          "ESP32LightSens",
          devSettings.settings,
          devSettings.owners,
          devSettings.coupledAssets,
        );
        break;
        
    }
    return undefined;
  }

}