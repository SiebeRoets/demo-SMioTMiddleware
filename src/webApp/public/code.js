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
  console.log(msg);
    //showNewData(msg)
    if(msg.type=="update"&&update_property=="parameter"){
        //update website
        HTMLid=msg.data.parameter + msg.subjectID;
        document.getElementById(HTMLid).innerHTML=msg.data.update_data;

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

//------Interface messages-------------//
function setFormListner(){
  document.getElementById('Login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  console.log("going to send form")
  fetch(event.target.action, {
      method: 'POST',
      body: new URLSearchParams(new FormData(event.target)) // event.target is the form
  }).then((resp) => {
      return resp.json(); // or resp.text() or whatever the server sends
  }).then(delay(1000))
  .then((body) => {
      console.log("new message received from form:"+JSON.stringify(body))
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