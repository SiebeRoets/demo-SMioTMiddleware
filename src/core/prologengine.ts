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
  constructor(engine:Engine){
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

  //Loop each device-----------------------------
  this.engine.devices.forEach((device: Device)=>{
    let rule;
    //add deviceID to name in order to identify in framework
    let name=this.formatToProlog(device.name)+"__"+(device.deviceId.toString());
    let type=this.formatToProlog(device.deviceType);
    rule="asset("+name+","+type+")."+"\n";
    rules+=rule;
    if(!uniquedevTypes.includes(type)){
      uniquedevTypes.push(type);
      rule="asset(S,device):- "+"asset(S,"+type+")."+"\n";
    }
    for(var param in device.parameters){
      var actions:string[]=[];
      // skip loop if the property is from prototype
      if (!device.parameters.hasOwnProperty(param)) continue;
        for(var act in device.parameters[param].actions){
          if (!device.parameters.hasOwnProperty(param)) continue;
            actions.push(this.formatToProlog(act)); 
        }
      rule="device_action("+name+","+this.formatToProlog(param)+","+JSON.stringify(actions)+").\n"
      rules+=rule;
    }
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
    rule="asset("+name+","+type+")."+"\n";
    rules+=rule;
  })
  console.log(rules);
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
emitAppEvent(evt){
  this.appEventBus.emit('toApp_event',evt);
}



}