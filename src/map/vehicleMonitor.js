var gmaps = window.google.maps;

var React = require('react'),
	VehicleMarker = require('./VehicleMarker.js'),
	LineControl = require('./LineControl.jsx'),
	stopMarkers = require('./stopMarkers.js');

function removeVehicles(vehicles){
	for(var i in vehicles){
		if (vehicles.hasOwnProperty(i)){
			vehicles[i].setMap(null);
		}
	}
	vehicles = {};
}

module.exports = {
	map: null,

	isMonitorOn: false,

	vehicles: {},

	trackedLineRef: '',

	start: function(map){
		this.map = map;

		this.renderLineControl();

		this.isMonitorOn = true;
		this.fetchVehicleData();
	},

	stop: function (){
		this.isMonitorOn = false;
	},

	fetchVehicleData: function (){
		if (!this.isMonitorOn){
			removeVehicles(this.vehicles);
			return;
		}

		var args = null;
		if (this.trackedLineRef){
			args = {lineRef: this.trackedLineRef};
		}

		$.getJSON('vm', args, this.updateVehicles.bind(this));
	},

	updateVehicles: function (data){
		var vehicles = data.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity;

		if (!vehicles){
			// TODO: notify user
			return;
		}

		var bounds = this.map.getBounds(),
			oldVehicles = this.vehicles,
			newVehicles = {};

		for(var i = 0; i < vehicles.length; i++){
			var monitoredVehicleJourney = vehicles[i].MonitoredVehicleJourney,
			coords = monitoredVehicleJourney.VehicleLocation,
			position = new gmaps.LatLng(coords.Latitude, coords.Longitude),
			destination = monitoredVehicleJourney.DestinationName.value;

			if (!destination || !bounds.contains(position)){
				continue;
			}

			var vehicleRef = monitoredVehicleJourney.VehicleRef.value;
			var vehicleMarker = oldVehicles[vehicleRef];

			if (vehicleMarker){
				vehicleMarker.setPosition(position);
				delete oldVehicles[vehicleRef];
			}
			else{
				vehicleMarker = new VehicleMarker({
					map: this.map,
					monitoredVehicleJourney: monitoredVehicleJourney,
					position: position,
					clickHandler: this.toggleTrackLine.bind(this, monitoredVehicleJourney.LineRef.value)
				});
			}
			newVehicles[vehicleRef] = vehicleMarker;
		}

		removeVehicles(oldVehicles);

		this.vehicles = newVehicles;

		setTimeout(this.fetchVehicleData.bind(this), 500);
	},

	toggleTrackLine: function (lineRef){
		if (this.trackedLineRef){
			this.trackedLineRef = '';
			stopMarkers.remove();
		}
		else{
			this.trackedLineRef = lineRef;
			stopMarkers.create(this.map, this.trackedLineRef);
		}

		this.renderLineControl();
	},

	renderLineControl: function (){
		var lineControl = React.createElement(LineControl, {
			lineCode: this.trackedLineRef,
			closeHandler: this.toggleTrackLine.bind(this)
		});

		React.render(lineControl, this.map.lineControlNode);
	}
};
