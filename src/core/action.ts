import {DriverType} from '../drivers/interfaces';
export class Action{
  name:string;
  driver: DriverType;
  commands:any[];

constructor(name:string,driver: DriverType;commands:any[];) {
  this.name=name;
  this.driver=driver;
  this.commands=commands
}

}