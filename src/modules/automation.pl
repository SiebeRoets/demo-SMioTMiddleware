:- module(automation, [handle/1]).
:- use_module(library(js)).
:- use_module(library(connector)).

handle(Event) :-
        automatedLights.

automatedLights:-asset(Room,room),
                get_value(Room, illuminance, Value),
                write('working with roomvalue: '),write(Value),nl,
                handle_value(Room,Value).               

get_value(R, illuminance, low) :- asset(R, room),  location(Dev,R),asset(Dev,lightsensor),get_parameter_value(Dev, illuminance, Val),(Val=<100).
get_value(R, illuminance, high) :- asset(R, room),  location(Dev,R),asset(Dev,lightsensor), get_parameter_value(Dev, illuminance, Val),(Val>100).
handle_value(R, low):- write('GOING TO SET LIGHTS ON'),nl,
                create_action_event(NewEvent, R, lights, on),
                forward(NewEvent, automation).
handle_value(R, high):- write('GOING TO SET LIGHTS OFF'),nl,
                        create_action_event(NewEvent, R, lights, off),
                        forward(NewEvent, automation).    