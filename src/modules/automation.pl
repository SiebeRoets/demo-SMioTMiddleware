:- module(automation, [handle/1]).
:- use_module(library(js)).
:- use_module(library(connector)).

handle(Event) :-
        automatedLights.

automatedLights:-asset(Room,room),
                  get_value(R, illuminance, low) ->set_value(R, lighting,on);
                  get_value(R, illuminance, high)->set_value(R, lighting,off).
                  

