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
export interface deviceParams{
  isConnected:boolean,
  lastSeen:Date,
  state:any
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
