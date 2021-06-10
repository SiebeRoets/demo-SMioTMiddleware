:- module(discovery, [handle/1, init/0]).
:- use_module(library(js)).
:- use_module(library(connector)).


handle(Event) :-
        event_id(Event, Id),
        write('handle in discovery '), write(Id),nl,
        event_type(Event,Type),
        handle_event(Event,Type).

handle_event(Event,update) :- prop(Event,update_property,Property),
                        ((Property==new_device)->(prop(Event,data,Data),handleNewDevice(Data));write('No new device')).
handle_event(Event,action) :- 
                prop(Event,data,Data),
                prop(Event,action_property,Action),
                (Action==start_search)->send_search_event;
                (Action==add_device)->(prop(Data,data,DevData),addDevice(DevData));
                (Action==replace_device)->(send_replace_req(Data));
                write('other than startSearch').
%handleEvent(Event,action):-...
%handleEvent(Event,update):-....
send_search_event:-create_object(Event,empty),
                get_timestamp(Time),
                generate_uuid(UuID),
                set_property(Event,type,action),
                set_property(Event,creator,discovery_module),
                set_property(Event,timestamp,Time),
                set_property(Event,id,UuID),
                set_property(Event,action_property,start_discover),
                send_external_event(Event,framework).
handleNewDevice(Data):-
                write('IN DISCOVERY HANDLE UPDATE'),
                disconnected_device(DeviceID,Type),
                write('found a disconnected device with type'),write(Type),nl,
                prop(Data,device_type,FoundType),
                write('the found devicetype is:  '),write(FoundType),nl,
                ==(FoundType,Type)-> send_req_replace_event(Data,DeviceID);
                send_add_req(Data).
%send a request to the app to replace a device
send_req_replace_event(Data,DeviceID):-
                    create_object(Event,empty),
                    get_timestamp(Time),
                    generate_uuid(UuID),
                    set_property(Event,type,update),
                    set_property(Event,creator,discovery_module),
                    set_property(Event,id,UuID),
                    set_property(Event,subject,notification),
                    set_property(Event,update_property,replacement_proposal),
                    set_property(Event,timestamp,Time),
                    write('sending req repl'),
                    %add replacement to data:
                    set_property(Data,replacement_for,DeviceID),
                    set_property(Event,data,Data),
                    send_external_event(Event,app).

%send data to framework to add the device.
send_replace_req(Data):-create_object(Event,empty),
                get_timestamp(Time),
                generate_uuid(UuID),
                set_property(Event,type,action),
                set_property(Event,creator,discovery_module),
                set_property(Event,timestamp,Time),
                set_property(Event,id,UuID),
                set_property(Event,action_property,replace_device),
                set_property(Event,data,Data),
                send_external_event(Event,framework).
%add de new device at runtime
replace_device(Data):-
                write('adding device'),
                prop(Data,newID,NewID),
                prop(Data,oldID,OldID),
                asset(OldID,Type),
                % we only need the type of the device
                \==(Type,device),
                location(OldID,Location),
                asserta(asset(DeviceID,DeviceType)),
                asserta(location(DeviceID,Location)),
                forall((device_action(OldID,ParameterName,Action)),(asserta(device_action(NewID,ParameterName,Action)))).

disconnected_device(DeviceID,Type):-
    systemState(Obj,device),
    prop(Obj,id,DeviceID),
    asset(DeviceID,Type),
    \==(Type,device),
    prop(Obj,isConnected,Value),
    ==(Value,false).  

event_devName(Event,Name):- prop(Event, name, Name).
event_ip(Event,Ip):- prop(Event, ipAdress, Ip).
event_payl(Event,Data):-prop(Event,data,Data).
init:- write('int in discovery'),bind_external_event(this, discovery_event, Event, (forward(Event, discovery))).

% close :- unbind...
