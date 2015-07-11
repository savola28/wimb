var gmaps = window.google.maps,
	React = require('react'),
	StopTimetable = require('../StopTimetable.jsx');

module.exports = {
	stopMarkers: [],

	create: function(map, lineRef) {
		$.getJSON('api', {
			request: 'lines',
			query: lineRef,
			epsg_in: 'wgs84',
			epsg_out: 'wgs84'
		}, function(lines) {
			this.stopMarkers = createStopMarkers(map, lines);
		}.bind(this));
	},

	remove: function() {
		this.stopMarkers.forEach(function(stopMarker) {
			stopMarker.setMap(null);
		});
		this.stopMarkers = [];
	}
};

function createStopMarkers(map, lines){
	var stops = resolveStops(lines);
	return stops.map(function(stop) {
		return createStopMarker(map, stop);
	});	
}

function resolveStops(lines) {
	var resolvedStops = [],
		resolvedStopCodes = {};

	lines.forEach(function(line) {
		line.line_stops.forEach(function(stop) {
			if (resolvedStopCodes[stop.code]) {
				return;
			}
			resolvedStopCodes[stop.code] = true;
			resolvedStops.push(stop);
		});
	});
	return resolvedStops;
}

function createStopMarker(map, stop) {
	var coords = stop.coords.split(','),
		longitude = coords[0],
		latitude = coords[1],
		position = new gmaps.LatLng(latitude, longitude),
		stopMarker = new gmaps.Marker({
			map: map,
			position: position,
			icon: {
				path: gmaps.SymbolPath.CIRCLE,
				scale: 3
			},
			stop: stop,
			infoWindow: null
		});

	gmaps.event.addListener(stopMarker, 'click', showStopInfoWindow.bind(null, stopMarker));
	
	return stopMarker;
}

function showStopInfoWindow(stopMarker){
	if (!stopMarker.infoWindow){
		stopMarker.infoWindow = new gmaps.InfoWindow();
	}
	
	stopMarker.infoWindow.setContent('Loading...');
	
	stopMarker.infoWindow.open(stopMarker.getMap(), stopMarker);
	
	$.getJSON('api', {
		request: 'stop',
		code: stopMarker.stop.code,
		dep_limit: 20,
		time_limit: 360
	}, function (stops) {
		showStopInfoWindowContent(stopMarker, stops);	
	});
}

function showStopInfoWindowContent(stopMarker, stops) {
	var containerNode = document.createElement('div');
	containerNode.className = 'map-infowindow-stop';
	
	stopMarker.infoWindow.setContent(containerNode);
	
	var stopTimetable = React.createElement(StopTimetable, {
		stop: stopMarker.stop,
		departures: stops[0].departures,
		enableFavoriteToggler: true
	});
	
	React.render(stopTimetable, containerNode);
}