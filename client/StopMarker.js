StopMarker.prototype = new google.maps.OverlayView();

function StopMarker(args) {
    this._map = args.map;
    this._code = args.code;
    this._position = args.position;
    this._element = null;
    
    // Explicitly call setMap on this overlay.
    this.setMap(this._map);
}

StopMarker.prototype.onAdd = function() {
    this._element = $('<div class="stop-marker">'+this._code+'</div>');
    
    // Add the element to the "overlayLayer" pane.
    var panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this._element[0]);
};

StopMarker.prototype.draw = function() {
    this.setPosition(this._position);
};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
StopMarker.prototype.onRemove = function() {
    this._element.remove();
    this._element = null;
};

StopMarker.prototype.setPosition = function(position) {
    this._position = position;
    var overlayProjection = this.getProjection();
    var pixelPosition = overlayProjection.fromLatLngToDivPixel(position),
        left = (pixelPosition.x - 12.5) + 'px',
        top = (pixelPosition.y - 10) + 'px';
        
    this._element.css('left', left).css('top', top);
};
