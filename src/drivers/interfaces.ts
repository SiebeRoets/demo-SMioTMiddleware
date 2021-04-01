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
