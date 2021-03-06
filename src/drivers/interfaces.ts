  export interface SMIoTEvent {
  type: string,
  id: string,
  subject:string,
  creator: string,
  timestamp: string,
  data:object
}
export interface RESTCall{
  requestType: string,
  url:string,
  body:object
}
export interface DeviceSettings{
  isConnected:boolean,
  lastSeen:Date,
  state:any,
  ip:string,
  authID:string,
  IdOnHub:string, //id assigned by hub
  hubDeviceId:number, //deviceId of parent hub
  addresses:Object,
  mac:string
}
enum ParameterType {
  Boolean,
  Number,
  String,
  Enum,
  Date,
}
export interface ParameterTypeInfo{
  parameterType:ParameterType,
  unit:string,
  description:string
}

export enum DriverType{
  RestDriver,
  MQTTDriver,
  BLEDriver
}


