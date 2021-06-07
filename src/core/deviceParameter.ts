
import {DriverType, ParameterTypeInfo} from '../drivers/interfaces';
import { Action } from './action';

//Class which contains paramaters (light, sensor values,..) that can be interfaced with
export class deviceParameter{
  parameterReference:string;
  parameterTypeInfo:ParameterTypeInfo;
  actions:any;
  currentValue;

  constructor(paramRef:string,paramType:ParameterTypeInfo,actions:any){
    this.actions={};
    this.parameterReference=paramRef;
    this.parameterTypeInfo=paramType;
    this.currentValue="Not aquired"
    //save all actions this parameter can take in list
    for(var key in actions){
      // skip loop if the property is from prototype
      if (!actions.hasOwnProperty(key)) continue;
      var act=new Action(key,actions[key].driverType,actions[key].interpreter,actions[key].commands)
      this.actions[key]=act;
    }
  }

  getActions(){
    return this.actions;
  }
  printValues(){
    console.log("parameter name is : "+this.parameterReference)
    console.log("read commands are:"+JSON.stringify(this.actions["Read"].commands));
  }
}