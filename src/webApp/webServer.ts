import {SMIoTEvent} from '../drivers/interfaces';
import express from "express";
import { EventEmitter } from "events";
import * as http from 'http';
import * as WebSocket from 'ws';
const path = require('path');
export class webServer {
    eventEmitter:EventEmitter;
    app:any;
    port:number;
    server:any;
    wss:any;
    loggedInUser:string;
    pageConfig;
    constructor(emitter){
        this.eventEmitter=emitter;
        this.app = express();
        this.port = 8080; // default port to listen
        this.server = http.createServer(this.app);
    } 
    initServer() {
        
        const server=this.server;
        this.wss = new WebSocket.Server({ server });
        //this.app.use(express.json());
        //const uiPath = path.resolve(path.resolve(__dirname, '../src/webApp'));
        this.app.set("views",path.join(__dirname,'./views'))
        this.app.use(express.static(path.join(__dirname,'./public')));
        this.app.use(express.urlencoded({
            extended: true
          }))
        this.app.set('view engine', 'ejs');

        // define a route handler for the default home page
        this.app.get('/', (req, res)=> {
            if(this.loggedInUser){
                this.getAllowedDevices();
                res.render('./pages/index',{user:this.loggedInUser,data:this.pageConfig})
            }
            else{ 
                res.render('./pages/login')
            }
          });
          this.app.get('/logout', (req, res)=> {
            this.loggedInUser=undefined;
            res.render('/pages/login')
          });
        this.app.get('/discover', (req, res)=> {
            if(this.loggedInUser){
                res.render('./pages/discovery',{user:this.loggedInUser})
            }
            else{ 
                res.render('./pages/login')
            }
        });
        this.app.post('/login', (req, res, next)=>{
            // req.body object has your form values
            console.log(req.body);
            if(this.verifyUser(req.body.username,req.body.password)){
                this.loggedInUser=req.body.username;
                res.json({
                    success: true,
                    message: "Login succeed"
                })
            }
            else{
                res.json({
                    success: false,
                    message: "Login failed"
                })
            }
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
    var randomId = Math.floor(Math.random() * 1000);
    msg['id']=randomId;
    console.log(msg);
    this.eventEmitter.emit('app_event',msg);
   }
   handleFrameworkMessage(msg:SMIoTEvent){
    if(msg.subject=="configuration"){
        this.pageConfig=msg.data;
    }
    if(msg.creator=="framework"){
        this.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(msg));
            }
          })
       } 
    }
    //more advanced authentication system.
    verifyUser(userName,password):boolean{
        let event={
            type:"action",
            creator: "app",
            subject: "loginUser",
            data:{
                    username:userName,
                    password:password
                }
          };
        //this.eventEmitter.emit("app_event",event);
        if(userName=="SiebeRoets"){
            return true;
        }
        else{
            return false
        }
    }
    getAllowedDevices(){
        let event={
            type:"query",
            creator: this.loggedInUser.toLowerCase(),
            subject: "getDevices"
          };
        this.eventEmitter.emit("app_event",event);
    }
     
}

  

