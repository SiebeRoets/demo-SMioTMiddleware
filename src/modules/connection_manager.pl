:- module(connection_manager, [handle/1, init/0]).
:- use_module(library(js)).
:- use_module(library(connector)).

handle(Event) :-
        event_subject(Event, SubjectId),
        event_data(Event,Data),
        event_type(Event,Type),
        write('there was a connection update on device: '),write(SubjectId),nl,
        handle_data(SubjectId,Data,Type).

handle_data(SubjectId,Data,update):-
        data_parameter(Data, ParameterName),
        data_value(Data, New),
        set_parameter_value(SubjectId, ParameterName, New).
disconnected_device(ObjectId,Type):-
        systemState(Obj,device),
        prop(Obj,id,ObjectId),
        asset(ObjectId,Type),
        prop(Obj,isConnected,Value),
        ==(Value,false).


init:- bind_external_event(this, connection_event, Event, (forward(Event, device))).


