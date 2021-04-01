import {SMIoTEvent} from './drivers/interfaces';
import express from "express";
import { EventEmitter } from "events";
import * as http from 'http';
import * as WebSocket from 'ws';
const path = require('path');
class webServer {
    eventEmitter:EventEmitter;
    app:any;
    port:number;
    server:any;
    wss:any;
    constructor(emitter){
        this.eventEmitter=emitter;
        this.app = express();
        this.port = 8080; // default port to listen
        this.server = http.createServer(this.app);
    } 
    initServer() {
    
        const server=this.server;
        this.wss = new WebSocket.Server({ server });
        this.app.use(express.json());
        const uiPath = path.resolve(path.resolve(__dirname, '../src/webApp'));
        this.app.use(express.static(path.resolve(uiPath, 'public')));
        
        // define a route handler for the default home page
        this.app.get('/*', function(req, res) {
            res.sendFile(path.resolve(uiPath, 'public/index.html'));
          });

        this.wss.on('connection', (ws: WebSocket) => {

            //connection is up, let's add a simple simple event
            ws.on('message', (message: string) => {
        
                //log the received message and send it back to the client
                console.log('received: message');
                this.handleAppMessage(JSON.parse(message))
            });
        
            //send immediatly a feedback to the incoming connection    
            ws.send('Hi there, I am a WebSocket server');
        });

        //listen to events
        this.eventEmitter.on("app_event",(args)=>{this.handleFrameworkMessage(args)})

        // start the Express server
        server.listen( this.port, () => {
            console.log( `server started at http://localhost:${ this.port }` );
        } );
   }
   handleAppMessage(msg:object){
    var randomId = Math.floor(Math.random() * 100);
    msg['id']=randomId;
    console.log(msg);
    this.eventEmitter.emit('app_event',msg);
   }
   handleFrameworkMessage(msg:SMIoTEvent){
    if(msg.creator=="framework"){
        this.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(msg));
            }
          })
       } 
    }
     
}

module.exports = webServer;


  

