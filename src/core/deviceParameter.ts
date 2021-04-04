
import {ParameterTypeInfo} from '../drivers/interfaces';

export class deviceParameter{
  parameterReference:string;
  parameterTypeInfo:ParameterTypeInfo;
  actions:any;

  constructor(paramRef:string,paramType:ParameterTypeInfo,actions:any){
    this.parameterReference=paramRef;
    this.parameterTypeInfo=paramType;
    this.actions=actions;
  }
}