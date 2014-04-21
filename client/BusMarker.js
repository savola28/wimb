BusMarker.prototype = new google.maps.OverlayView();

function BusMarker(args) {
    this._map = args.map;
    this._content = args.content;
    this._position = args.position;
    this._route = args.route;
    this._element = null;
    
    // Explicitly call setMap on this overlay.
    this.setMap(this._map);
}

BusMarker.prototype.onAdd = function() {
    this._element = $('<div class="bus-marker">'+this._content+'</div>');
    
    // Add the element to the "overlayLayer" pane.
    var panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this._element[0]);
};

BusMarker.prototype.draw = function() {
    this.setPosition(this._position);
    this.setRoute(this._route);
};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
BusMarker.prototype.onRemove = function() {
    this._element.remove();
    this._element = null;
};

BusMarker.prototype.setPosition = function(position) {
    this._position = position;
    var overlayProjection = this.getProjection();
    var pixelPosition = overlayProjection.fromLatLngToDivPixel(position),
        left = (pixelPosition.x - 12.5) + 'px',
        top = (pixelPosition.y - 10) + 'px';
        
    this._element.css('left', left).css('top', top);
};

BusMarker.prototype.setRoute = function(route) {
    this._route= route;
    this._element.tooltip({
        trigger: 'click',
        container: this._element,
        html: true,
        title: this._routeToHTML()
    });
};

BusMarker.prototype._routeToHTML = function() {
    var routeArray = [];
            
    if (this._route.origin !== '' && this._route.destination !== ''){
        routeArray.push(this._route.origin);
        routeArray.push('&rarr;');
        routeArray.push(this._route.destination);
    }
    else{
        routeArray.push('At the terminus');
    }
    
    return '<div style="white-space: nowrap">' + routeArray.join('&nbsp;') + '</div>';
};