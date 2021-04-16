import {DriverType} from '../drivers/interfaces';
export class Action{
  name:string;
  driver: DriverType;
  interpreter:string;
  commands:any[];

constructor(name:string,driver: DriverType,interpreter:string,commands:any[]) {
  this.name=name;
  this.driver=driver;
  this.interpreter=interpreter;
  this.commands=commands
}

}