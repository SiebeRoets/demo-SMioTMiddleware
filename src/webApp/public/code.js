//------------framework methods-----------//
var ws;
var newDevModal;
var loginTab;
window.addEventListener('DOMContentLoaded', (event) => {
  openSocket();
  setFormListner();
  var tab=document.getElementById('loginTabs')
  M.Tabs.init(tab);
  var elems =document.getElementById('modal1')
  var instances = M.Modal.init(elems);
  newDevModal = M.Modal.getInstance(elems);
});
var lastDevice;
var lastReplaceEvent;
function openSocket(){
  if ("WebSocket" in window) {    
    // Let us open a web socket
    ws = new WebSocket("ws://localhost:8080");
  
    ws.onopen = function() {
        console.log("websocket connection is now open")
    };
    ws.onmessage = function (evt) { 
       var received_msg = evt.data;
       console.log('message received')
       handleMessage(JSON.parse(received_msg))
    };
  }
}
function handleMessage(msg){
  //handle parameter update messages
    if(msg.type=="update"&&msg.update_property=="parameter"){
        //update website
        HTMLid=msg.data.parameter + msg.subjectID;
        let container=document.getElementById(HTMLid);
        if(container!=undefined){
          container.innerHTML=msg.data.value;
        }    
    }
  //handle notifications
    if(msg.subject=="notification"){
        printNotification(msg);
    }
}

function printNotification(msg){
  if(msg.update_property=="disconnected_device"){  
   let newMsgHTML= '<div class="card"><div class="card-content"><span class="card-title">Connectivity</span><p>'+
            msg.data.id+' has been disconnected</p></div></div>';
  document.getElementById('consoleSide').innerHTML+=newMsgHTML;
  }
  else if(msg.update_property=="replacement_proposal"){
    window.lastReplaceEvent=msg;
    let newMsgHTML= '<div class="card"><div class="card-content"><span class="card-title">Discovery</span><span>New '+
    msg.data.platform +' device discoverd to replace: '+msg.data.replacement_for+'</span><button class="waves-effect waves-light blue btn-small" onClick="sendReplaceEvent()" style="margin-left:45px">Add</button></div></div>';
    document.getElementById('consoleSide').innerHTML+=newMsgHTML;
  }
}
//send message to server to replace the device
function sendReplaceEvent(){
  //TODO improve history support
  let event=window.lastReplaceEvent;
  event.type="action",
  event["action_property"]="replace_device"
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
  else{
    openSocket();
  }
}

function setModal(data){
  document.getElementById('ModaldevName').innerHTML=data.name;
  document.getElementById('deviceBrand').innerHTML="Brand: "+data.deviceBrand;
  document.getElementById('ipAdress').innerHTML="Ip: "+data.ipAdress;
  newDevModal.open();
}
function closeModal(){
  newDevModal.close();
}
function addDevice(){
  let event={
    type:"action",
    creator: "app",
    subject: "discovery",
    data:{action:"addDevice", deviceData:lastDevice}
  };
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
  else{
    openSocket();
  }
}
function startSearch(){
  let event={
    type:"action",
    creator: "app",
    subject: "discovery",
    data:{action:"startSearch"}
  };
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
  else{
    openSocket();
  }
 
}
function showNewData(newEvent){
  var table = document.getElementById('eventtTable')
  var row= table.insertRow();
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  cell1.innerHTML = newEvent.type;
  if(newEvent.data==undefined){
    cell2.innerHTML=newEvent.name;
  }
  else{
    cell2.innerHTML = newEvent.data;
  }
cell3.innerHTML= newEvent.timestamp;

}

let delay = (time) => (result) => new Promise(resolve => setTimeout(() => resolve(result), time));

//------Login form-------------//
function setFormListner(){
  document.getElementById('Login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  fetch(event.target.action, {
      method: 'POST',
      body: new URLSearchParams(new FormData(event.target))
  }).then((resp) => {
      return resp.json(); 
  }).then(delay(1000))
  .then((body) => {
      if(body.success){
        window.location.href="/";
      }
      else{
        showToast({title:"Authentication",payload:body.message})

      }
  }).catch((error) => {
      // TODO handle error
  });
});
}
function showToast(data){
  toastHTML ='<div><p class="toastText head">'+data.title+'</p><p class="toastText">'+data.payload+"</p></div>";
  M.toast({html: toastHTML,displayLength:5000,classes:"customToast"});
}