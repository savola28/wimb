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
			vehicleMarker = this.vehicles[vehicleRef];

			if (!bounds.contains(position)){
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
			setTimeout(this.fetchVehicleData.bind(this), 500);
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
			React.unmountComponentAtNode(this.lineControlNode);
			this.trackedLineRef = '';
			this.removeLinePolyline();
			this.removeStopMarkers();
		}
		else{
			var lineRef = event.data.monitoredVehicleJourney.LineRef.value;
			this.trackedLineRef = lineRef;
			this.fetchLine(lineRef);
		}
	},
	
	fetchLine: function (lineRef){
		$.getJSON('api', {
			request: 'lines',
			query: lineRef,
			epsg_in: 'wgs84',
			epsg_out: 'wgs84'
		}, this.showLine.bind(this));
	},

	showLine: function (linesData){
		var lineData = linesData[0];
		this.addLineControl(lineData);
		this.createLinePolyline(lineData);
		this.createStopMarkers(lineData.line_stops);
	},
	
	addLineControl: function (lineData){
		if (!this.lineControlNode){
			this.lineControlNode = document.createElement('div');
			$(this.map.controlsNode).append(this.lineControlNode);
		}
		
		React.renderComponent(LineControl({
			line: lineData,
			closeHandler: this.toggleTrackLine.bind(this)
		}), this.lineControlNode);
	},
	
	createLinePolyline: function (lineData){
		var lineCoords = lineData.line_shape.split('|');
			
		var path = lineCoords.map(function (coords){
			coords = coords.split(',');
			return new gmaps.LatLng(coords[1], coords[0]);
		});
	
		this.linePolyline = new gmaps.Polyline({
			path: path,
			geodesic: true,
			strokeColor: '#FF0000',
			strokeOpacity: 1.0,
			strokeWeight: 1,
			map: this.map
		});
	},

	removeLinePolyline: function (){
		this.linePolyline.setMap(null);
		this.linePolyline = null;		
	},
	
	createStopMarkers: function (stops){
		for(var i = 0; i < stops.length; i++){
			var stop = stops[i],
				coords = stop.coords.split(','),
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
		}
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

function showStopInfoWindowContent(data){
	
	var containerNode = document.createElement('div');
	containerNode.className = 'map-infowindow-stop';
	
	this.infoWindow.setContent(containerNode);
	
	React.renderComponent(StopTimetable({
		stop: this.stop,
		departures: data[0].departures
	}), containerNode);
}
