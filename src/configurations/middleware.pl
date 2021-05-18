% facts describing the structure of the reasoning middleware
% connections between modules describe to which events a module subscribed (based on the sender of the event and the type of event)
%connection(app, access_control, action).
connection(app, query, query).
connection(app, access_control, query).
connection(access_control, app, update).
connection(access_control, bus, action).
connection(access_control, bus, query).
%connection(bus, access_control, update).
connection(bus, device, action).
connection(device, data_preprocessing, update).
connection(data_preprocessing, app, update).
connection(data_preprocessing, bus, update).

connection(bus, asset_device_conversion, update).
connection(bus, asset_device_conversion, action).
connection(asset_device_conversion, bus, update).
connection(asset_device_conversion, bus, action).
connection(asset_device_conversion, data_preprocessing, update).
connection(discovery, discovery,update).
connection(app,discovery,action).

%connection(asset_device_conversion, bus).
%connection(bus, asset_device_conversion).
%connection(device_state_component, connection_manager).
%connection(connection_manager, bus).
%connection(automation, bus).
%connection(bus, automation).
