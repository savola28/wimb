var gmaps = google.maps,
	VehicleMarker = require('./VehicleMarker.js'),
	StopTimetable = require('../StopTimetable.jsx'),
	LineControl = require('./LineControl.jsx');

module.exports = {
	map: null,
	
	vehicles: {},
	
	trackedLineRef: '',
	
	linePolyline: null,
	
	lineControlNode: null,
	
	stopMarkes: [],
	
	isMonitorOn: false,
	
	start: function(){
		this.isMonitorOn = true;
		this.fetchVehicleData();
	},

	stop: function (){
		this.isMonitorOn = false;
	},

	fetchVehicleData: function (){
		var args = null;
		if (this.trackedLineRef){
			args = {lineRef: this.trackedLineRef};
		}

		$.getJSON('vm', args, this.updateVehicles.bind(this));
	},
	
	updateVehicles: function (data){
		var vehicles = data.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity;

		if (!vehicles){
			// TODO: errormessage:'No vehicle data available'
			return;
		}

		var bounds = this.map.getBounds(),
			newVehicles = {};

		for(var i = 0; i < vehicles.length; i++){
			var monitoredVehicleJourney = vehicles[i].MonitoredVehicleJourney,
			vehicleRef = monitoredVehicleJourney.VehicleRef.value,
			coords = monitoredVehicleJourney.VehicleLocation,
			position = new gmaps.LatLng(coords.Latitude, coords.Longitude),
			destination = monitoredVehicleJourney.DestinationName.value,
			vehicleMarker = this.vehicles[vehicleRef];

			if (!destination || !bounds.contains(position)){
				continue;
			}

			if (vehicleMarker){
				vehicleMarker.setPosition(position);
				delete this.vehicles[vehicleRef];
			}
			else{
				vehicleMarker = new VehicleMarker({
					map: this.map,
					monitoredVehicleJourney: monitoredVehicleJourney,
					position: position,
					clickHandler: this.toggleTrackLine.bind(this)
				});
			}
			newVehicles[vehicleRef] = vehicleMarker;
		}

		this.removeVehicles();

		this.vehicles = newVehicles;

		if (this.isMonitorOn){
			this.fetchVehicleData();
		}
		else{
			this.removeVehicles();
		}
	},

	removeVehicles: function (){
		for(var i in this.vehicles){
			if (this.vehicles.hasOwnProperty(i)){
				this.vehicles[i].setMap(null);
			}
		}
		this.vehicles = {};
	},
	
	toggleTrackLine: function (event){
		if (this.trackedLineRef){
			React.unmountComponentAtNode(this.map.lineControlNode);
			this.trackedLineRef = '';
			this.removeStopMarkers();
		}
		else{
			var lineRef = event.data.monitoredVehicleJourney.LineRef.value;
			this.trackedLineRef = lineRef;
			this.fetchLine(lineRef);
		}
	},
	
	fetchLine: function (lineRef){
		$(this.map.lineControlNode).append('<div class="alert alert-info" role="alert">Loading stops...</div>');
		
		$.getJSON('api', {
			request: 'lines',
			query: lineRef,
			epsg_in: 'wgs84',
			epsg_out: 'wgs84'
		}, this.showLineStops.bind(this));
	},

	showLineStops: function (lines){
		var renderedStops = {};
		for(var i = 0; i < lines.length; i++){
			var stops = lines[i].line_stops;
			for(var j = 0; j < stops.length; j++){
				var stop = stops[j];
				if (renderedStops[stop.code]){
					continue;
				}
				renderedStops[stop.code] = true;
				this.createStopMarker(stop);
			}
		}
		
		React.renderComponent(LineControl({
			lineCode: lines[0].code_short,
			closeHandler: this.toggleTrackLine.bind(this)
		}), this.map.lineControlNode);
	},
	
	createStopMarker: function (stop){
		var coords = stop.coords.split(','),
			longitude = coords[0],
			latitude = coords[1],
			position = new gmaps.LatLng(latitude, longitude),
			stopMarker = new gmaps.Marker({
				map: this.map,
				position: position,
				icon: {
					path: gmaps.SymbolPath.CIRCLE,
					scale: 3
				},
				stop: stop,
				infoWindow: null
			});
		
		gmaps.event.addListener(stopMarker, 'click', showStopInfoWindow.bind(stopMarker));
		
  		this.stopMarkes.push(stopMarker);
	},
	
	removeStopMarkers: function (){
		for(var i = 0; i < this.stopMarkes.length; i++){
			this.stopMarkes[i].setMap(null);
		}
		this.lineStops = [];		
	}
};

function showStopInfoWindow(){
	if (!this.infoWindow){
		this.infoWindow = new gmaps.InfoWindow();
	}
	
	this.infoWindow.setContent('Loading...');
	
	this.infoWindow.open(this.getMap(), this);
	
	$.getJSON('api', {
		request: 'stop',
		code: this.stop.code,
		dep_limit: 20,
		time_limit: 360
	}, showStopInfoWindowContent.bind(this));
}

function showStopInfoWindowContent(stops){
	
	var containerNode = document.createElement('div');
	containerNode.className = 'map-infowindow-stop';
	
	this.infoWindow.setContent(containerNode);
	
	React.renderComponent(StopTimetable({
		stop: this.stop,
		departures: stops[0].departures,
		renderOneDeparturePerLine: true,
		enableFavoriteToggler: true
	}), containerNode);
}
