:- module(access_control, [handle/1]).
:- use_module(library(js)).
:- use_module(library(connector)).


handle(Event) :- event_subject(Event,Subject),
                 handleEvt(Event,Subject).
        

handleEvt(Event,getDevices):- 
                                event_creator(Event,Creator),
                                forall((asset(Dev,device),owner(Creator,Dev)),
                                  (
                                    write('working with'), write(Dev), write(' from creator:'), write(Creator),nl,
                                    create_object(Resp,empty),
                                    get_timestamp(Time),
                                    set_property(Resp,type,config),
                                    set_property(Resp,timestamp,Time),
                                    set_property(Resp,name,Dev),
                                    get_device_actions(Params,Dev),
                                    set_property(Resp,params,Params),
                                    send_external_event(Resp,app)
                                  )
                                ).
                                                            
get_device_actions(Params,Dev):-
                                create_object(Params,empty),
                                forall(device_action(Dev,Parameter,Actions),
                                  (
                                    set_property(Params,Parameter,Actions)
                                   % get_value(Dev,Parameter)
                                  )
                                ).
            
%allow(Event) :- false.
%deny(Event) :- false.
allow(Event) :-  event_creator(Event,Creator), event_subject(Event,Subject), allow(Creator,Subject).

allow(Person,Room) :- asset(Person,person), asset(Room,room), owner(Person,Room), location(Person,Room).
allow(CleaningStaff,Room) :- asset(CleaningStaff,cleaning_staff), time_between(time(10,0,0),time(15,0,0)), location(CleaningStaff,Room).

deny(Event) :- event_creator(Event,john).