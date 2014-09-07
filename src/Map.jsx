/** @jsx React.DOM */

var gmaps = google.maps,
	vehicleMonitor = require('./map/vehicleMonitor.js');

module.exports = React.createClass({
	map: null,
	
	render: function () {
		var className = 'map-canvas';
		
		if (this.props.activeView !== 'map'){
			className += ' hidden';
		}
		
		return (
			<div className={className}></div>
		);
	},
	
	componentDidMount: function () {
		this.tryToActivate();
	},
	
	componentDidUpdate: function (){
		this.tryToActivate();
	},
	
	tryToActivate: function (){
		if (this.props.activeView === 'map'){
			this.createMap();
			vehicleMonitor.start();
		}
		else {
			vehicleMonitor.stop();
		}
	},
	
	createMap: function (){
		if (this.map){
			return;
		}
		
		this.map = new gmaps.Map(this.getDOMNode(), {
			center: new gmaps.LatLng(61.49815, 23.76103), // Tampere
			zoom: 14,
			mapTypeId: gmaps.MapTypeId.ROADMAP,
			disableDefaultUI: true,
			zoomControl: true,
			zoomControlOptions: {
				style: gmaps.ZoomControlStyle.LARGE,
				position: gmaps.ControlPosition.LEFT_BOTTOM
			},
			styles: [
				{'featureType': 'transit', 'stylers': [{'visibility': 'off'}]},
				{'featureType': 'poi', 'stylers': [{'visibility': 'off'}]}
			]
		});
		
		createPositionButton(this.map);
		
		createControlsNode(this.map);
		
		vehicleMonitor.map = this.map;
	}
});

function createControlsNode(map){
	map.controlsNode = document.createElement('div');
	map.controls[gmaps.ControlPosition.TOP_LEFT].push(map.controlsNode);
}

function createPositionButton(map){
	var positionMarker = new GeolocationMarker(map);
	
	var button = $('<button class="btn btn-default">My location</button>').click(function (){
		map.setCenter(positionMarker.getPosition());
	});
	
	map.controls[gmaps.ControlPosition.TOP_RIGHT].push(button[0]);
}
