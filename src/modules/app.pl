:- module(app, [handle/1, init/0]).

:- use_module(library(js)).
:- use_module(library(connector)).

handle(Event) :-
        send_external_event(Event,app).

init:- bind_app_event(this, app_event, Event, (forward(Event, app))).

