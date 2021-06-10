:- module(connection_manager, [handle/1, init/0]).
:- use_module(library(js)).
:- use_module(library(connector)).

handle(Event) :-
        event_subject(Event, SubjectId),
        event_data(Event,Data),
        event_type(Event,Type),
        write('there was a connection update on device: '),write(SubjectId),nl,
        handle_data(SubjectId,Data,Type),
        %send notification if a device is disconnected
        forall(disconnected_device(DeviceID,DeviceType),send_connection_notification(DeviceID)).

handle_data(SubjectId,Data,update):-
        data_parameter(Data, ParameterName),
        data_value(Data, New),
        set_parameter_value(SubjectId, ParameterName, New).

%if device is disconnected send a notifications
send_connection_notification(DeviceID):-
        %send search event to discovery module
        send_discover_evt,
        %send event to app
        create_object(Event,empty),
        get_timestamp(Time),
        generate_uuid(UuID),
        set_property(Event,type,update),
        set_property(Event,creator,connection_manager),
        set_property(Event,id,UuID),
        set_property(Event,subject,notification),
        set_property(Event,update_property,disconnected_device),
        set_property(Event,timestamp,Time),
        create_object(Data,empty),
        set_property(Data,id,DeviceID),
        set_property(Event,data,Data),
        send_external_event(Event,app).

%check if there is a device currently disconnected
disconnected_device(DeviceID,Type):-
        systemState(Obj,device),
        prop(Obj,id,DeviceID),
        asset(DeviceID,Type),
        \==(Type,device),
        prop(Obj,isConnected,Value),
        ==(Value,false).
%notify discovery module to start discovery        
send_discover_evt:-
        create_object(Evt,empty),
        set_property(Evt,type,action),
        generate_uuid(UuID),
        set_property(Evt,id,UuID),
        get_timestamp(Time),
        set_property(Evt,timestamp,Time),
        set_property(Evt,creator,connection_manager),
        create_object(O,empty),
        set_property(Evt,data,O),
        set_property(Evt,action_property,start_search),
        forward(Evt,connection_manager).

init:-  bind_external_event(this, connection_event, Event, (forward(Event, connection_manager))).


