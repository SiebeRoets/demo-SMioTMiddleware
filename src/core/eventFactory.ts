
export class EventFactory{
  currID:number
  eventCount:number
  constructor(){
    this.currID=0;
    this.eventCount=0;
  }
  generateUUID():number{
    this.currID++;    
    return this.currID;
  }
  createUpdateEvent(settings){
    var d=new Date()
    var evt={
      type:"update",
      event_id:this.generateUUID(),
      creation_time:d.toLocaleString(),
      creator:settings.creator,
      subject:settings.subject,
      update_parameter:settings.update_parameter,
      update_data:settings.update_data,
      origin_event:settings.origin_vent,
      connectivity_state:settings.connectivity_state  
    }
    return evt;
  }
  createActionEvent(settings){
    var d=new Date()
    var evt={
      type:"action",
      event_id:this.generateUUID(),
      creation_time:d.toLocaleString(),
      creator:settings.creator,
      subject:settings.subject,
      data:settings.data,
    }
    return evt;
  }
}
