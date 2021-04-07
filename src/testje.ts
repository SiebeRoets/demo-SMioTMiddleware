import {EventFactory} from "./core/eventFactory";
var factory=new EventFactory();
var settings={
    creator:"Joske",
    subject:"lightstatus",
    origin_event:"N/A",
    update_property:"on"
}
var newEvt=factory.createActionEvent(settings)
console.log(JSON.stringify(newEvt));
var newEvt=factory.createActionEvent(settings)
console.log(JSON.stringify(newEvt));

