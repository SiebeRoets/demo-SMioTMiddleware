import { Engine } from "./engine";
var pl=require('tau-prolog');

export class PrologEngine{
  engine:Engine;
  session;
  prolog;
  eventBus;
  appEventBus;
  constructor(engine:Engine){
    this.eventBus = require('./event-bus');
    this.appEventBus= require('./app-event-bus');
    this.prolog=pl;
    require( "tau-prolog/modules/lists" )( this.prolog );
    require( "tau-prolog/modules/js" )( this.prolog );
    require( "tau-prolog/modules/os" )( this.prolog );
    require( "./connector" )( this.prolog, this );
    this.engine=engine;
    this.session=this.prolog.create(10000);
  }
  run(){
    this.session.consult("./main.pl", {
      success: ()=> {
          // print alle rules in sessie uit
          console.log(this.session.rules);  
          // Query the goal
          this.session.query("init.", {
              success: ()=> {
                  // Look for answers
                  this.session.answers(answer=>
                          console.log(this.session.format_answer(answer)));       
                  //startEmittingEvents();
              },
              error: (err)=> {
                this.session.answers(x => console.log(this.prolog.format_answer(x)));
              console.log(err); }
  
          });
      },
      error: (err) =>{ console.log(err);
          console.log(this.prolog.format_answer(err))    }
  });
  }
  addListener(evt, fn){
    this.eventBus.addListener(evt, fn);
};
}