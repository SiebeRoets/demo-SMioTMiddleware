var xmlhttprequest = require("xmlhttprequest");
import{Device} from "../core/device"
import {RESTCall} from './interfaces';
export class RestDriver{
  
 sendHTTPrequest(reqs:RESTCall[],device:Device){
  return new Promise((resolve, reject) => {
    var xmlHttp = new xmlhttprequest.XMLHttpRequest();
    var responses:string[]=[];
    function onSuccess(responseText: string) {
        responses.push(responseText);
        if(responses.length==reqs.length){
          resolve(responses);
        }  
      }
      function onFailure(responseText: string) {
          reject(responseText);
      }
      reqs.forEach((req)=>{
        var reqUrl=this.replaceValue(device,req.url);
          xmlHttp.open(req.requestType,reqUrl);
          if(req.body!=undefined){
            xmlHttp.send(req.body);
          }
          else{
            xmlHttp.send();
          }
      });
      xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            onSuccess(xmlHttp.responseText);
        else if (xmlHttp.readyState == 4) {
            onFailure(xmlHttp.responseText);
        }
  }
  })
  
 }
 //replace values in dummy url
 replaceValue(device: Device, url: String) {
  let matches=url.match(/<.*?>/g);
  matches.forEach((val)=>{
    let replacement=device.settings[val.replace(/(<|>)/g, '' )];
    url=url.replace(val,replacement);
  })
  return url
}



}




}


