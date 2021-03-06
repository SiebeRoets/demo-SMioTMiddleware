:- module(data_preprocessing, [handle/1] ).
:- use_module(library(js)).
:- use_module(library(lists)).
:- use_module(library(connector)).
:- use_module(library(random)).

handle(Event) :-
        write('in data preprocessing'),
        event_id(Event, EventId),
        event_subject(Event, SubjectId),
        event_data(Event,Data),
        data_parameter(Data, ParameterName),
        write('there was a update on device: '),write(SubjectId), write(' on paramter: '),write(ParameterName),nl,
        handle_data(SubjectId,Data),
        forward(Event, data_preprocessing).

filter(pass, _, _, _) :- true.
filter(value_change, New, Old, _) :- New\==Old.
filter(absolute_difference, New, Old, [delta=Delta]) :- Diff is abs(-(New,Old)) , write('difference: '),write(Diff),nl,(Diff>=Delta).
filter(relative_difference, New, Old, [threshold=Threshold]) :-  Old =< Threshold, New> Threshold ; (Old>=Threshold, New<Threshold).

handle_data(SubjectId,Data) :-
             data_parameter(Data, ParameterName),
             data_value(Data, New),
             set_parameter_value(SubjectId, ParameterName, New),
             write('done setting value in preprocessing').
             %(filter(SubjectId, Data) -> (set_parameter_value(SubjectId, ParameterName, New),create_parameter_update_event(Event, SubjectId, Data),forward(Event, data_preprocessing));true)).

filter(SubjectId,Data) :-
        data_parameter(Data, ParameterName),
        data_value(Data, New),
        parameter(SubjectId, ParameterName, Parameter) ->
            (property(Parameter, value, Old) ->
                (filter(SubjectId, ParameterName, New, Old))
            ;true)
        ;true.

filter(SubjectId, ParameterName, New, Old):-
    filter_type(SubjectId, ParameterName,Type, Arg) -> filter(Type, New, Old, Arg); filter(value_change, New, Old, _).


