import { Engine } from "./engine";


export class PrologEngine{
  engine:Engine;
  session;
  prolog;
  eventBus;
  appEventBus;
  constructor(engine:Engine){
    this.eventBus = require('./event-bus');
    this.appEventBus= require('./app-event-bus');
    this.prolog=require('tau-prolog');
    require( "tau-prolog/modules/lists" )( this.prolog );
    require( "tau-prolog/modules/js" )( this.prolog );
    require( "tau-prolog/modules/os" )( this.prolog );
    require( "./connector" )( this.prolog, this );
    this.engine=engine;
    this.session=pl.create(10000);
  }
  run(){
    session.consult("../main.pl", {
      success: function() {
          // print alle rules in sessie uit
          console.log(session.rules);  
          // Query the goal
          session.query("init.", {
              success: function() {
                  // Look for answers
                  session.answers(answer=>
                          console.log(session.format_answer(answer)));       
                  //startEmittingEvents();
              },
              error: function(err) {
                  session.answers(x => console.log(pl.format_answer(x)));
              console.log(err); }
  
          });
      },
      error: function (err) { console.log(err);
          console.log(pl.format_answer(err))    }
  });
  }
  addListener(evt, fn){
    this.eventBus.addListener(evt, fn);
};
}