var gmaps = window.google.maps;

VehicleMarker.prototype = new gmaps.OverlayView();

function VehicleMarker(args) {
	this._map = args.map;
	this._monitoredVehicleJourney = args.monitoredVehicleJourney;
	this._position = args.position;
	this._clickHandler = args.clickHandler;
	this._element = null;

	this.setMap(this._map);
}

VehicleMarker.prototype.onAdd = function() {
	this._element = $('<div class="bus-marker">'+this._monitoredVehicleJourney.LineRef.value+'</div>');

	this._element.click({monitoredVehicleJourney: this._monitoredVehicleJourney}, this._clickHandler);

	var panes = this.getPanes();
	panes.overlayMouseTarget.appendChild(this._element[0]);
};

VehicleMarker.prototype.draw = function() {
	this.setPosition(this._position);
};

VehicleMarker.prototype.onRemove = function() {
	this._element.remove();
	this._element = null;
};

VehicleMarker.prototype.setPosition = function(position) {
	if (!this._element){
		return;
	}

	this._position = position;
	var overlayProjection = this.getProjection();
	var pixelPosition = overlayProjection.fromLatLngToDivPixel(position),
	left = (pixelPosition.x - 12.5) + 'px',
	top = (pixelPosition.y - 10) + 'px';

	this._element.css('left', left).css('top', top);
};

VehicleMarker.prototype._getTooltipHTML = function() {
	var content = '',
	origin = this._monitoredVehicleJourney.OriginName.value,
	destination = this._monitoredVehicleJourney.DestinationName.value;

	if (origin !== '' && destination !== ''){
		content = origin + '&nbsp;&rarr;&nbsp;' + destination;
	}
	else{
		content = 'At the terminus';
	}

	return '<div style="white-space: nowrap">' + content + '</div>';
};

module.exports = VehicleMarker;
