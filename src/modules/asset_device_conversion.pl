:- module(asset_device_conversion, [handle/1]).
:- use_module(library(js)).
:- use_module(library(lists)).
:- use_module(library(connector)).
:- use_module(library(random)).

handle(Event) :-
       event_type(Event, EventType),
       handle_event(Event,EventType).


handle_event(Event,update):-event_subject(Event, Subj),
                            event_data(Event, Data),
                            data_parameter(Data, ParameterName),
                            data_value(Data, Value),
                            forall(map(Asset, AssetParam, Subj, ParameterName),handle_update(Asset, AssetParam)).
handle_event(Event,action):-event_subject(Event, Subj),
                            event_data(Event, Data),
                            data_parameter(Data, ParameterName),
                            data_value(Data, Value),
                            get_value(Subj, lights,OldVal),
                            write('OLD VAL: '),write(OldVal),nl,
                            filter(value_change, Value, OldVal),
                            set_value(Subj, ParameterName, Value).


filter(value_change, New, Old) :- New\==Old.

handle_update(Asset,Param):-
    write('in handle update from ASSET<--->DEVICE with: '),write(Asset),write(Param),nl,
    get_value(Asset,Param,V), create_parameter_update_event(NewEvent, Asset,Param,V),write('PARAMTER VALUE: '),write(V), forward(NewEvent, asset_device_conversion).

get_value(R, illuminance, low) :- asset(R, room),  location(Dev,R),asset(Dev,lightsensor), get_parameter_value(Dev, illuminance, Val),Val=<100.
get_value(R, illuminance, high) :- asset(R, room),  location(Dev,R),asset(Dev,lightsensor), get_parameter_value(Dev, illuminance, Val),Val>100.

set_value(R, lights,off):-asset(R, room),  forall((location(Dev,R),device_action(Dev, lightstatus, write)),(set_external_parameter(Dev, lightstatus, off))).
set_value(R, lights,on):-asset(R, room),  forall((location(Dev,R),device_action(Dev, lightstatus, write)),(location(Dev,R), set_external_parameter(Dev, lightstatus, on))).
get_value(R, lights,off):-asset(R, room),  location(Dev,R),asset(Dev,lamp),is_connected(Dev), get_parameter_value(Dev, lightstatus, Val),==(Val,off).
get_value(R, lights,on):-asset(R, room),  location(Dev,R), asset(Dev,lamp),is_connected(Dev),get_parameter_value(Dev, lightstatus, Val),==(Val,on).

is_connected(Device):-get_parameter_value(Device,isConnected,Value),
                        (Value==true).

get_value(Dev, ParamName, Val):- asset(Dev, device), parameter(Dev, ParamName, Param), property(Param, value, Val).

set_value(Dev, ParamName, Value) :- asset(Dev, device), action_type(Dev, ParamName, write),  create_action_event(Event, Dev, ParamName, Value), forward(Event, asset_device_conversion).

get_value(R, climate, good) :- get_value(R, heat,  TVal),get_value(R, humidity, HVal),TVal==normal,Hval==normal.
get_value(R, climate, bad) :- \+get_value(R, climate,  good).

get_value(R, heat, low) :- asset(R, room),  location(Dev,R), get_value(Dev, temperature, Val),Val=<17.
get_value(R, heat, normal) :- asset(R, room), location(Dev,R), get_value(Dev, temperature, Val),Val>17, Val<50.
get_value(R, heat, high) :- asset(R, room), location(Dev,R), get_value(Dev, temperature, Val), Val>=50.

get_value(R, humidity, low) :- asset(R, room),  location(Dev,R), get_value(Dev, humidity, Val), Val=<40.
get_value(R, humidity, normal) :- asset(R, room), location(Dev,R), get_value(Dev, humidity, Val),Val>40, Val<70.
get_value(R, humidity, high) :- asset(R, room), location(Dev,R), get_value(Dev, humidity, Val),  Val>=70.

set_value(R, heat, low) :- asset(R, room),  location(Dev,R), action_type(Dev, temperature, write), set_value(Dev, temperature, 15).
set_value(R, heat, normal) :- asset(R, room),  location(Dev,R), action_type(Dev, temperature, write),   set_value(Dev, temperature, 20).
set_value(R, heat, high) :-asset(R, room), location(Dev,R),  action_type(Dev, temperature, write),set_value(Dev, temperature, 25).

set_value(R, humidity, low):- asset(R,room),  location(D, R), asset(D, humidifier), get_value(D, state, S), S==on, set_value(D, state, off).
set_value(R, humidity, normal):-asset(R,room),  location(D, R),  asset(D,humidifier), get_value(R, humidity, V),get_value(S, state, S),((V==low, S==off) -> (set_value(D, state, on));((V==high,S==on)->(set_value(D,state,off)))).
set_value(R, humidity, high):-asset(R,room),  location(D, R), asset(D, humidifier),get_value(D, state, S), S=='off', set_value(D, state, on).

set_value(R,climate,good):- set_value(R, heat, normal), set_value(R, humidity, normal).




