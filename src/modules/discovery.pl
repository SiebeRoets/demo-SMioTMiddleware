:- module(discovery, [handle/1, init/0]).
:- use_module(library(js)).
:- use_module(library(connector)).


handle(Event) :-
        event_id(Event, Id),
        get_timestamp(Time),
        generate_uuid(UId),
        write(Time), write('with id: '), write(UId),nl,
        write('handle in discovery '), write(Id),nl,
        event_type(Event,Type),
        ((Type==update) -> (handleUpdate(Event)); (handleAction(Event))).
       % prop(Data,startSearch,Val),
       % write('handle in discovery '), write(Id),nl,
       % write('New device: '), write(Name),nl,
       % write('Ip adress: '), write(Ip),nl.
       % write('Payload: '), write(Val),nl,
       % (Val) -> sendReq ; write('not sending request').
       % create_object(O,devices),
       % set_property(O,name,Name),
       % create_object(Props,_),
       % set_property(Props,ip,Ip),
       % set_property(O,settings,Props).

handleUpdate(Event) :- prop(Event,state,State),
                        ((State==new_device)->(prop(Event,data,Data),handleNewDevice(Data));write('No new device')).
handleAction(Event) :- 
                prop(Event,data,Data),
                prop(Data,action,Action),
                ((Action==startSearch)->sendSearchEvent;
                ((Action==addDevice)->(prop(Data,deviceData,DevData),addDevice(DevData));
                write('other than startSearch'))).
%handleEvent(Event,action):-...
%handleEvent(Event,update):-....
sendSearchEvent:-create_object(Event,empty),
                set_property(Event,type,action),
                set_property(Event,creator,framework),
                set_property(Event,timestamp,vandaag),
                set_property(Event,data,startDiscover),
                send_external_event(Event).
handleNewDevice(Data):-
                %get_timestamp(Time),
                %write(Time),nl,
                prop(Data,name,Value),
                ((find_by_prop(Dev,name,Value))->write('Found device matching name');
                (write('Found NO device with matching name'),sendAddReq(Data))).

sendAddReq(Data):-create_object(Event,empty),
                get_timestamp(Time),
                set_property(Event,type,action),
                set_property(Event,creator,framework),
                set_property(Event,timestamp,Time),
                create_object(Payload,empty),
                set_property(Payload,action,addDevice),
                set_property(Payload,deviceData,Data),
                set_property(Event,data,Payload),
                send_external_event(Event).
addDevice(Data):-
                write('adding device'),
                generate_uuid(UuID),
                prop(Data,deviceBrand,Brand),
                prop(Data,name,Name),
                prop(Data,ipAdress,Ip),
                create_object(Device,empty),
                set_property(Device,uuid,UuID),
                set_property(Device,name,Name),
                set_property(Device,type,device),
                set_property(Device,deviceBrand,Brand),
                set_property(Device,ip,Ip),
                save_asset(Device,device).

find_by_prop(Obj,Propname,Value):-
    object(Obj,device),
    prop(Obj,Propname,V),
    ==(V,Value).

event_devName(Event,Name):- prop(Event, name, Name).
event_ip(Event,Ip):- prop(Event, ipAdress, Ip).
event_payl(Event,Data):-prop(Event,data,Data).
init:- write('int in discovery'),bind_external_event(this, discovery_event, Event, (forward(Event, discovery))).

% close :- unbind...