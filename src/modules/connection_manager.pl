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
        forall(disconnected_device(ObjectId,Type),send_connection_notification(ObjectId)).

handle_data(SubjectId,Data,update):-
        data_parameter(Data, ParameterName),
        data_value(Data, New),
        set_parameter_value(SubjectId, ParameterName, New).
send_connection_notification(DeviceID):-
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

disconnected_device(ObjectId,Type):-
        systemState(Obj,device),
        prop(Obj,id,ObjectId),
        asset(ObjectId,Type),
        prop(Obj,isConnected,Value),
        ==(Value,false).


init:- bind_external_event(this, connection_event, Event, (forward(Event, device))).


