var gmaps = window.google.maps;
var vehicleMonitor = require('./vehicleMonitor.js');

function createMap(mapNode) {
	// default is central of Tampere
	var coordinates = {
		latitude: 61.49815,
		longitude: 23.76103
	};

	var map = new gmaps.Map(mapNode, {
		center: new gmaps.LatLng(coordinates.latitude, coordinates.longitude),
		zoom: 14,
		mapTypeId: gmaps.MapTypeId.ROADMAP,
		disableDefaultUI: true,
		zoomControl: true,
		zoomControlOptions: {
			style: gmaps.ZoomControlStyle.LARGE,
			position: gmaps.ControlPosition.LEFT_BOTTOM
		},
		styles: [{
			'featureType': 'transit',
			'stylers': [{
				'visibility': 'off'
			}]
		}, {
			'featureType': 'poi',
			'stylers': [{
				'visibility': 'off'
			}]
		}]
	});

	map.lineControlNode = document.createElement('div');
	map.controls[gmaps.ControlPosition.TOP_LEFT].push(map.lineControlNode);

	var positionMarker = new window.GeolocationMarker(map);

	// Use current position once it is available
	var positionListener = positionMarker.addListener('position_changed', function() {
		map.setCenter(positionMarker.getPosition());
		gmaps.event.removeListener(positionListener);
	});

	var button = $('<button class="btn btn-default">My location</button>').click(function() {
		map.setCenter(positionMarker.getPosition());
	});
	map.controls[gmaps.ControlPosition.TOP_RIGHT].push(button[0]);

	return map;
}

module.exports = {
	map: null,

	show: function(mapNode) {
		if (!this.map) {
			this.map = createMap(mapNode);
		}
		vehicleMonitor.start(this.map);
	},

	hide: function() {
		vehicleMonitor.stop();
	}
};
