:- module(automation, [handle/1]).
:- use_module(library(js)).
:- use_module(library(connector)).

handle(Event) :-
        write('in automation'),nl,
        automatedLights.

automatedLights:-asset(Room,room),
                  get_value(Room, illuminance, low) ->create_action_event(Event, Room, lighting, on),forward(NewEvent, automation);
                  get_value(Room, illuminance, high)->create_action_event(Event, Room, lighting, off),forward(NewEvent, automation).
                  

