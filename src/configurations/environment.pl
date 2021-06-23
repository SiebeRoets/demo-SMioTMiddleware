:- dynamic(asset/2).
:- dynamic(location/2).
:- dynamic(device_action/3).

map(R, lights, Dev, lightstatus) :- asset(R, room), location(Dev,R).

map(R, heat, Dev, temperature) :- asset(R, room), location(Dev,R).
map(R, humidity, Dev, humidity) :- asset(R, room), location(Dev,R).
map(R, climate, R, temperature) :- asset(R, room).
map(R, climate, R, humidity) :- asset(R, room).

filter_type(temp_sens_1, temperature,  absolute_difference, [delta=5]).
filter_type(temp_sens_1, humidity,  pass, _).

