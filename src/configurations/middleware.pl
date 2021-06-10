% facts describing the structure of the reasoning middleware
% connections between modules describe to which events a module subscribed (based on the sender of the event and the type of event)
%connection(app, access_control, action).
connection(app, query, query).
connection(app, access_control, query).
connection(app, asset_device_conversion, action).
connection(access_control, app, update).
%connection(access_control, bus, action).
%connection(access_control, bus, query).
%connection(bus, access_control, update).
connection(bus, device, action).
connection(device, data_preprocessing, update).
connection(data_preprocessing, app, update).
connection(data_preprocessing, asset_device_conversion, update).
connection(data_preprocessing, automation,update).
connection(automation,asset_device_conversion,action).
connection(asset_device_conversion, data_preprocessing, update).
connection(bus, asset_device_conversion, update).
connection(bus, asset_device_conversion, action).
connection(discovery, discovery,update).
connection(app,discovery,action).
connection(connection_manager, connection_manager,update).
connection(connection_manager, discovery,action).

%connection(asset_device_conversion, bus).
%connection(bus, asset_device_conversion).
%connection(device_state_component, connection_manager).
%connection(automation, bus).
%connection(bus, automation).
