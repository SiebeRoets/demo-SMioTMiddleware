:- module(access_control, [handle/1]).
:- use_module(library(js)).

handle(Event) :- event_subject(Event,Subject),
                 handleEvt(Event,Subject).
        

handleEvt(Event,getDevices):-   write('in handleEVENTTTTTTTT'),
                                event_creator(Event,Creator),
                                asset(Dev,devices),
                                owner(Dev,Creator),
                                create_object(Resp,empty),
                                get_timestamp(Time),
                                set_property(Resp,type,config),
                                set_property(Resp,timestamp,Time),
                                set_property(Resp,name,Dev),
                                get_device_actions(Params),
                                set_property(Resp,params,Params),
                                send_external_event(Resp,app).
                                                            
get_device_actions(Params):-create_object(Params,empty),
                            device_action(Dev,Parameter,Actions),
                            set_property(Params,Parameter,Actions).
%allow(Event) :- false.
%deny(Event) :- false.
allow(Event) :-  event_creator(Event,Creator), event_subject(Event,Subject), allow(Creator,Subject).

allow(Person,Room) :- asset(Person,person), asset(Room,room), owner(Person,Room), location(Person,Room).
allow(CleaningStaff,Room) :- asset(CleaningStaff,cleaning_staff), time_between(time(10,0,0),time(15,0,0)), location(CleaningStaff,Room).

deny(Event) :- event_creator(Event,john).