
export class EventFactory{
  currID:number
  eventCount:number
  constructor(currID:number){
    this.currID=currID;
    this.eventCount=0;
  }
  formatToProlog(input:string):string{
    let result=input.toLowerCase();
    result=result.replace(/[&\/\\#,+()$~%.'":\s*?<>{}-]/g, '');
    return result;
  }
  generateUUID():number{
    this.currID++;    
    return this.currID;
  }
  createUpdateEvent(settings){
    var d=new Date()
    //change name to name prolog understands
    let prologName=this.formatToProlog(settings.subject)+"__"+(settings.subjectID.toString());
    var evt={
      type:"update",
      id:this.generateUUID(),
      creation_time:d.toLocaleString(),
      creator:settings.creator,
      subject:prologName,
      subjectID:settings.subjectID,
      update_property:'parameter',
      data:{
        parameter:settings.update_parameter,
        value:settings.update_data
      }
    }
    return evt;
  }
  createActionEvent(settings){
    var d=new Date()
    var evt={
      type:"action",
      action:settings.action,
      event_id:this.generateUUID(),
      creation_time:d.toLocaleString(),
      creator:settings.creator,
      subject:settings.subject,
      data:settings.data,
    }
    return evt;
  }
}
