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
loadEnvironmentData(){
  let rules="";
  let uniquedevTypes=[];
  this.engine.devices.forEach((device: Device)=>{
    let rule;
    //add deviceID to name in order to identify in framework
    let name=device.name.toLowerCase()+"__"+(device.deviceId.toString());
    rule="asset("+name+","+device.deviceType+")."+"\n";
    rules+=rule;
    if(!uniquedevTypes.includes(device.deviceType)){
      uniquedevTypes.push(device.deviceType);
      rule="asset(S,device):- "+"asset(S,"+device.deviceType+")."+"\n";
    }
    for(var param in device.parameters){
      var actions:string[]=[];
      // skip loop if the property is from prototype
      if (!device.parameters.hasOwnProperty(param)) continue;
        for(var act in device.parameters[param].actions){
          if (!device.parameters.hasOwnProperty(param)) continue;
            actions.push(act.toLocaleLowerCase()); 
        }
      rule="device_action("+name+","+param.toLowerCase()+","+JSON.stringify(actions)+").\n"
      rules+=rule;
    }
  this.engine.assets.forEach((asset:Asset)=>{
    let rule;
    //add assetID to name in order to identify in framework
    let name=asset.assetName.toLowerCase()+"__"+(asset.assetId.toString());
    rule="asset("+name+","+asset.type+")."+"\n";
    rules+=rule;
  })
  })
  console.log(rules);
}
appendToProgram(programmingCode: string) {
  this.program = this.program.concat(programmingCode);
}
}