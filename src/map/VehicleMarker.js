'use strict';

var gmaps = window.google.maps;

function VehicleMarker(args) {
	this.map = args.map;
	this.monitoredVehicleJourney = args.monitoredVehicleJourney;
	this.position = args.position;
	this.clickHandler = args.clickHandler;
	this.element = null;

	this.setMap(this.map);
}

VehicleMarker.prototype = new gmaps.OverlayView();

VehicleMarker.prototype.onAdd = function() {
	this.element = $('<div class="bus-marker">' + this.monitoredVehicleJourney.LineRef.value + '</div>');

	this.element.click(this.clickHandler);

	var panes = this.getPanes();
	panes.overlayMouseTarget.appendChild(this.element[0]);
};

VehicleMarker.prototype.draw = function() {
	this.setPosition(this.position);
};

VehicleMarker.prototype.onRemove = function() {
	this.element.remove();
	this.element = null;
};

VehicleMarker.prototype.setPosition = function(position) {
	if (!this.element){
		return;
	}

	this.position = position;
	var overlayProjection = this.getProjection();
	var pixelPosition = overlayProjection.fromLatLngToDivPixel(position),
	left = (pixelPosition.x - 12.5) + 'px',
	top = (pixelPosition.y - 10) + 'px';

	this.element.css('left', left).css('top', top);
};

VehicleMarker.prototype.getTooltipHTML = function() {
	var content = '',
	origin = this.monitoredVehicleJourney.OriginName.value,
	destination = this.monitoredVehicleJourney.DestinationName.value;

	if (origin !== '' && destination !== ''){
		content = origin + '&nbsp;&rarr;&nbsp;' + destination;
	}
	else{
		content = 'At the terminus';
	}

	return '<div style="white-space: nowrap">' + content + '</div>';
};

module.exports = VehicleMarker;
