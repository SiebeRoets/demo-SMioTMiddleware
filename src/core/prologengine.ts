import { Asset } from "./asset";
import { Device } from "./device";
import { Engine } from "./engine";
var pl=require('tau-prolog');
var fs = require('fs');

export class PrologEngine{
  engine:Engine;
  program: string;
  session;
  prolog;
  eventBus;
  appEventBus;
  systemState;
  constructor(engine:Engine){
    this.systemState={}
    this.engine=engine;
    this.program=fs.readFileSync("./main.pl").toString();
    this.eventBus = require('./event-bus');
    this.appEventBus= require('./app-event-bus');
    this.prolog=pl;
    require( "tau-prolog/modules/lists" )( this.prolog );
    require( "tau-prolog/modules/js" )( this.prolog );
    require( "tau-prolog/modules/os" )( this.prolog );
    require( "./connector" )( this.prolog, this );
    this.session=this.prolog.create(10000);
    this.eventBus.on('framework_event',(evt)=>{this.handleAddRequest(evt)});
  }
  run(){
    this.session.consult(this.program, {
      success: ()=> {
          // print alle rules in sessie uit
          console.log(this.session.rules);  
          // Query the goal
          this.session.query("init.", {
              success: ()=> {
                  // Look for answers
                  this.session.answers(answer=>
                          console.log(this.session.format_answer(answer)));       
                  //startEmittingEvents();
              },
              error: (err)=> {
                this.session.answers(x => console.log(this.prolog.format_answer(x)));
              console.log(err); }
  
          });
      },
      error: (err) =>{ console.log(err);
          console.log(this.prolog.format_answer(err))    }
  });
  }
addListener(evt, fn){
  this.eventBus.addListener(evt, fn);
};
addAppListener(evt, fn){
  this.appEventBus.addListener(evt, fn);
};

loadEnvironmentData(){
  let rules="";
  let uniquedevTypes=[];
  this.systemState["device"]=[];
  //Loop each device-----------------------------
  this.engine.devices.forEach((device: Device)=>{
    let rule;
    let dev={}
    //add deviceID to name in order to identify in framework
    let name=this.formatToProlog(device.name)+"__"+(device.deviceId.toString());
    let type=this.formatToProlog(device.deviceType);
    dev["id"]=name;
    dev["type"]=type;
    dev["frameworkID"]=device.deviceId;
    dev["coupledAssets"]=device.coupledAssets;
    rule="asset("+name+","+type+")."+"\n";
    rules+=rule;
    if(!uniquedevTypes.includes(type)){
      uniquedevTypes.push(type);
      rule="asset(S,device):- "+"asset(S,"+type+")."+"\n";
      rules+=rule;
    }
    for(var param in device.parameters){
      var actions:string[]=[];
      // skip loop if the property is from prototype
      if (!device.parameters.hasOwnProperty(param)) continue;
        for(var act in device.parameters[param].actions){
          if (!device.parameters.hasOwnProperty(param)) continue;
            actions.push(this.formatToProlog(act));
            rule="device_action("+name+","+this.formatToProlog(param)+","+this.formatToProlog(act)+").\n"
            rules+=rule;
        }
      //initialize values of params to null
      dev[this.formatToProlog(param)]=null;
    }
    this.systemState["device"].push(dev);
    //find owner rules
    device.owners.forEach((ownerId)=>{
      let owner=this.engine.assetByID(ownerId);
      if(owner!=undefined && owner.assetType=="user"){
        let ownerName=this.formatToProlog(owner.assetName)+"__"+(owner.assetId.toString())
        rule="owner("+ownerName+","+name+").\n";
        rules+=rule;
      }
    });
    //find links between assets and devices
    device.coupledAssets.forEach((assetId)=>{
      let asset=this.engine.assetByID(assetId);
      if(asset!=undefined){
        let ruleName;
        let assetName=this.formatToProlog(asset.assetName)+"__"+(asset.assetId.toString())
        if(asset.assetType==="room"){
          ruleName="location";
        }
        //could add more logice names
        else{
          //default option
          ruleName=this.formatToProlog(asset.assetType)+"_link";
        }
        rule=ruleName+"("+name+","+assetName+").\n";
        rules+=rule;
      }  
    });
  })

  //Loop each asset--------------------------
  this.engine.assets.forEach((asset:Asset)=>{
    let rule;
    //add assetID to name in order to identify in framework
    let name=this.formatToProlog(asset.assetName)+"__"+(asset.assetId.toString());
    let type=this.formatToProlog(asset.assetType);
    if(this.systemState[type]==undefined){
      this.systemState[type]=[];
      let stateAsset={}
      stateAsset["id"]=name;
      stateAsset["type"]=type;
      stateAsset["frameworkID"]=asset.assetId;
      this.systemState[type].push(stateAsset);
    }
    else{
      let stateAsset={}
      stateAsset["id"]=name;
      stateAsset["type"]=type;
      stateAsset["frameworkID"]=asset.assetId;
      this.systemState[type].push(stateAsset);
    }
    rule="asset("+name+","+type+")."+"\n";
    rules+=rule;
  })
  //console.log(rules);
  //console.log(JSON.stringify(this.systemState,null,2))
  this.appendToProgram(rules);
}
readMiddlewareConnections(){
  let rules="";
  let rule;
  this.engine.engineConfig.connectionRules.forEach((element) => {
    rule="connection("+element.moduleA+","+element.moduleB+","+element.eventType+ ")."+"\n";
    rules+=rule;
  });
  console.log(rules);
}
//format text to prolog readable strings
formatToProlog(input:string):string{
  let result=input.toLowerCase();
  result=result.replace(/[&\/\\#,+()$~%.'":\s*?<>{}-]/g, '');
  return result;
}
appendToProgram(programmingCode: string) {
  this.program = this.program.concat(programmingCode);
}
generateUUID():number{
  //take better care of message id's
  return Math.floor(Math.random() * 1000);
}
emitEvent(evt){
  this.eventBus.emit('framework_event',evt);
}
emitAppEvent(evt,type){
  this.appEventBus.emit('toApp_event',evt);
}
readParam(deviceName,ParamRef){
  console.log("going to read param: " + ParamRef + " From device " +deviceName);
  let a=deviceName.toString().split("__");
  this.engine.deviceByID(a[1]).readParameter(ParamRef);
}
writeParam(deviceName,ParamRef,Value){
  console.log("going to write param: " + ParamRef + " From device " +deviceName);
  let a=deviceName.toString().split("__");
  this.engine.deviceByID(a[1]).writeParameter(ParamRef,Value);
}
handleAddRequest(request){
  //check if its a replace request
  if(request.action_property=="replace_device"){
    //get settings of previous device
    let oldDeviceID= request.data.replacement_for.toString().split("__");
    let oldDevice=this.engine.deviceByID(oldDeviceID[1]);
    let deviceSettings={
      __uuid:this.engine.EventFactory.generateUUID(),
      name:request.data.name,
      platform:request.data.platform,
      deviceType:request.data.device_type,
      settings:{
        ip:request.data.ip_address,
        isConnected:true
      },
      owners:oldDevice.owners,
      coupledAssets:oldDevice.coupledAssets
    }
    var newDevice=this.engine.deviceManager.createDevice(deviceSettings);
    this.engine.addDevice(newDevice);
    //add new device to systemState
    let name=this.formatToProlog(newDevice.name)+"__"+(newDevice.deviceId.toString());
    let type=this.formatToProlog(newDevice.deviceType);
    let dev={}
    dev["id"]=name;
    dev["type"]=type;
    dev["frameworkID"]=newDevice.deviceId;
    dev["coupledAssets"]=newDevice.coupledAssets;
    for(var param in newDevice.parameters){
      var actions:string[]=[];
      // skip loop if the property is from prototype
      if (!newDevice.parameters.hasOwnProperty(param)) continue;
      //initialize values of params to null
      dev[this.formatToProlog(param)]=null;
    }
    this.systemState["device"].push(dev);
    //send succes to discovery
    let evtSettings={
      creator:"framework",
      subject:"add_device",
      action_property:"add_device",
      data:{
        newID:name,
        oldID:request.data.replacement_for
      }
    }
    console.log('device added!')
    let evt=this.engine.EventFactory.createActionEvent(evtSettings);
    //discovery will add rules at run time
    this.eventBus.emit('discovery_event',evt);
    //save permanently on disk
    this.engine.saveAssetFile();
  }
  else{
    //add normal device
  }
}


}