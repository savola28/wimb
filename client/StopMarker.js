StopMarker.prototype = new google.maps.OverlayView();

function StopMarker(args) {
    this._map = args.map;
    this._stop = args.stop;
    this._element = null;
    
    // Explicitly call setMap on this overlay.
    this.setMap(this._map);
}

StopMarker.prototype.onAdd = function() {
    this._element = $('<div class="stop-marker">'+this._stop.code+'</div>');
    
    this._element.on('click', {stop: this._stop}, app.startMonitoring.bind(app));
    
    var panes = this.getPanes();
    panes.overlayImage.appendChild(this._element[0]);
};

StopMarker.prototype.draw = function() {
    this.setPosition();
};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
StopMarker.prototype.onRemove = function() {
    this._element.remove();
    this._element = null;
};

StopMarker.prototype.setPosition = function() {
    var overlayProjection = this.getProjection(),
        position = this.coordsToPosition(this._stop.coords),
        pixelPosition = overlayProjection.fromLatLngToDivPixel(position),
        left = (pixelPosition.x - 17.5) + 'px',
        top = (pixelPosition.y - 10) + 'px';
        
    this._element.css('left', left).css('top', top);
};

StopMarker.prototype.coordsToPosition = function (coords)
{
    coords = coords.split(',');
    var longitude = coords[0],
        latitude = coords[1];
    
    return new google.maps.LatLng(latitude, longitude);
};
