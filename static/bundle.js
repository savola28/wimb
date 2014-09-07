(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @jsx React.DOM */
var Menu = require('./Menu.jsx'),
	MainView = require('./MainView.jsx'),
	Map = require('./Map.jsx');

module.exports = React.createClass({displayName: 'exports',
	render: function() {
		return (
			React.DOM.div({className: "app"}, 
			    Menu({views: ['home', 'map'], activeView: this.props.activeView}), 
			    MainView({activeView: this.props.activeView}), 
			    Map({activeView: this.props.activeView})
		    )
		);
	}
});

},{"./MainView.jsx":2,"./Map.jsx":3,"./Menu.jsx":4}],2:[function(require,module,exports){
/** @jsx React.DOM */
module.exports = React.createClass({displayName: 'exports',
	render: function() {
		var className = 'main-view';
		
		if (this.props.activeView !== 'home'){
			className += ' hidden';
		}
		
		return (
			React.DOM.div({className: className}, "Hello seppo")
		);
	}
});

},{}],3:[function(require,module,exports){
/** @jsx React.DOM */

var gmaps = google.maps,
	vehicleMonitor = require('./map/vehicleMonitor.js');

module.exports = React.createClass({displayName: 'exports',
	map: null,
	
	render: function () {
		var className = 'map-canvas';
		
		if (this.props.activeView !== 'map'){
			className += ' hidden';
		}
		
		return (
			React.DOM.div({className: className})
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
		
		//createInfoNode(this.map);
		
		createPositionButton(this.map);
		
		createControlsNode(this.map);
		
		vehicleMonitor.map = this.map;
	}
});

function createInfoNode(map){
	var infoNode = $('<div class="alert alert-info hidden" role="alert"></div>');
	map.controls[gmaps.ControlPosition.TOP_LEFT].push(infoNode[0]);
	map.showInfo = function (infoText){
		infoNode.text(infoText).removeClass('hidden');
	};
	map.hideInfo = function (){
		infoNode.text('').addClass('hidden');
	};
}

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

},{"./map/vehicleMonitor.js":10}],4:[function(require,module,exports){
/** @jsx React.DOM */

var views = ['home', 'map'];

module.exports = React.createClass({displayName: 'exports',
	render: function() {
		return (
			React.DOM.div({className: "navbar navbar-fixed-top navbar-inverse", role: "navigation"}, 
			    React.DOM.div({className: "container"}, 
			        React.DOM.div({className: "navbar-header"}, 
			            React.DOM.button({type: "button", className: "navbar-toggle", 'data-toggle': "collapse", 'data-target': ".navbar-collapse"}, 
			                React.DOM.span({className: "icon-bar"}), 
			                React.DOM.span({className: "icon-bar"}), 
			                React.DOM.span({className: "icon-bar"})
			            ), 
			            React.DOM.a({className: "navbar-brand", href: "#"}, "WIMB")
			        ), 
			        React.DOM.div({className: "collapse navbar-collapse"}, 
			            React.DOM.ul({className: "nav navbar-nav"}, 
			            	this.renderItems()
			            )
			        )
			    )
			)
		);
	},
	
	renderItems: function (){
		return views.map(this.renderItem);
	},
	
	renderItem: function (viewId){
		var isActive = (this.props.activeView === viewId);
		
		return (React.DOM.li({key: viewId, className: isActive ? 'active' : ''}, React.DOM.a({href: '#'+viewId, onClick: this.handleMenuClick}, viewId)));		
	},
	
	handleMenuClick: function (event){
		$('.navbar-collapse', this.getDOMNode()).collapse('hide');
	}
});

},{}],5:[function(require,module,exports){
/** @jsx React.DOM */
var favoriteStorage = require('./favoriteStorage.js'),
	locale = 'fi',
	options = {hour: 'numeric', minute: 'numeric'},
	timeFormatter = new Intl.DateTimeFormat(locale, options);

moment.locale(locale);

module.exports = React.createClass({displayName: 'exports',
	getInitialState: function() {
		if (favoriteStorage.get('stops', this.props.stop.code)){
			return {isFavorite: true};
		}
		return {isFavorite: false};
	},
	
	render: function() {
	    var content;
	    
	    if (this.props.departures.length){
	        content = (
                React.DOM.table({className: "table"}, 
                    React.DOM.thead(null, 
                        React.DOM.tr(null, 
                            React.DOM.th(null, "Time"), 
                            React.DOM.th(null, "Line")
                        )
                    ), 
                    React.DOM.tbody(null, this.renderDepartures())
                )
            );
	    }
	    else{
	        content = React.DOM.i(null, "No departures");
	    }

        var iconClass = 'glyphicon glyphicon-star';
		if (!this.state.isFavorite){
			iconClass += '-empty';
		}

		return (
            React.DOM.div(null, 
                React.DOM.button({type: "button", className: "btn btn-default", onClick: this.toggleFavoriteStop}, 
	    			React.DOM.span({className: iconClass}), 
	    			this.props.stop.code, " ", this.props.stop.name
	    		), 
                content
            )
		);
	},
	
	renderDepartures: function (data){
        return this.props.departures.map(function(departure) {
        	var date = departureToDate(departure),
        		time = timeFormatter.format(date),
        		deltaTime = moment(date).fromNow();

        	return (
                React.DOM.tr({key: date.toISOString() + departure.code}, 
                    React.DOM.td({title: time}, deltaTime), 
                    React.DOM.td({title: departure.name1}, departure.code)
        	    )
        	);
		}.bind(this));
    },
	
	toggleFavoriteStop: function (){
		if (this.state.isFavorite){
			favoriteStorage.remove('stops', this.props.stop.code);
			this.setState({isFavorite: false});
		}
		else{
			favoriteStorage.add('stops', this.props.stop.code);
			this.setState({isFavorite: true});
		}
	}
});

function departureToDate(departure){
    var date = departure.date.toString(),
        year = date.substr(0, 4),
        month = date.substr(4, 2),
        day = date.substr(6, 2),
        time = departure.time.toString(),
        hours = time.substr(0, 2),
        minutes = time.substr(2, 2);
    
    return new Date(year + '-' + month + '-' + day + ' ' + hours + ':' + minutes);
}

},{"./favoriteStorage.js":7}],6:[function(require,module,exports){
var App = require('./App.jsx');

window.onhashchange = renderApp;

renderApp();

function renderApp(){
    var activeView = location.hash.substring(1) || 'home',
        title = activeView === 'home' ? '' : ' - ' + activeView;
    
    document.title = 'WIMB' + title;
    
    React.renderComponent(App({
        activeView: activeView
    }), document.body);
}

},{"./App.jsx":1}],7:[function(require,module,exports){
module.exports = {
    add: function(storage, id, value){
        var items = this.getAll(storage);
        items[id] = value || {};
        this._storeItems(storage, items);
    },
    
    remove: function(storage, id){
        var items = this.getAll(storage);
        delete items[id];
        this._storeItems(storage, items);
    },
    
    get: function(storage, id){
        var items = this.getAll(storage);
        return items[id];
    },
    
    getAll: function(storage){
        return JSON.parse(localStorage.getItem(storage)) || {};
    },
    
    _storeItems: function(storage, items){
        return localStorage.setItem(storage, JSON.stringify(items));
    }
};

},{}],8:[function(require,module,exports){
/** @jsx React.DOM */
var favoriteStorage = require('../favoriteStorage.js');

module.exports =  React.createClass({displayName: 'exports',
	getInitialState: function() {
		if (favoriteStorage.get('lines', this.props.line.code_short)){
			return {isFavorite: true};
		}
		return {isFavorite: false};
	},
	
	render: function() {
		var iconClass = 'glyphicon glyphicon-star';
		if (!this.state.isFavorite){
			iconClass += '-empty';
		}
		
		return (
		    React.DOM.div({className: "btn-group"}, 
	    		React.DOM.button({type: "button", className: "btn btn-default", onClick: this.toggleFavoriteLine}, 
	    			React.DOM.span({className: iconClass}), 
	    			this.props.line.code_short
	    		), 
	            React.DOM.button({type: "button", className: "btn btn-default", onClick: this.props.closeHandler}, 
	                React.DOM.span({className: "glyphicon glyphicon-remove"})
	            )
			)
		);
	},
	
	toggleFavoriteLine: function (){
		if (this.state.isFavorite){
			favoriteStorage.remove('lines', this.props.line.code_short);
			this.setState({isFavorite: false});
		}
		else{
			favoriteStorage.add('lines', this.props.line.code_short);
			this.setState({isFavorite: true});
		}
	}
});

},{"../favoriteStorage.js":7}],9:[function(require,module,exports){
var gmaps = google.maps;

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

},{}],10:[function(require,module,exports){
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
			this.map.showInfo('No vehicle data available');
			return;
		}

		var bounds = this.map.getBounds(),
			newVehicles = {};

		for(var i = 0; i < vehicles.length; i++){
			var monitoredVehicleJourney = vehicles[i].MonitoredVehicleJourney,
			lineRef = monitoredVehicleJourney.LineRef.value,
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
	
	this.infoWindow.setContent(containerNode);
	
	React.renderComponent(StopTimetable({
		stop: this.stop,
		departures: data[0].departures
	}), containerNode);
}

},{"../StopTimetable.jsx":5,"./LineControl.jsx":8,"./VehicleMarker.js":9}]},{},[6]);