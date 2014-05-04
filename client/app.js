var app = 
{
    map: null,
    
    vehicles: {},
    
    stopMarkers: [],
    
    showVehicles: true,
    
    updatingVehicles: false,
    
    buttons: null,
    
	start: function ()
	{
        try{
            this.isCoolBrowser();
            this.initModal();
            this.initMap();
		}
		catch (error){
            document.body.innerHTML = error.toString();
        }
	},

	isCoolBrowser: function ()
	{
		var unsupportedApis =  [];
		
		if (!navigator.geolocation) unsupportedApis.push('geolocation');

        if (!window.localStorage) unsupportedApis.push('localStorage');

		if (unsupportedApis.length > 0){
            throw "Your ancient browser doesn't support following and mandatory APIs:<br>" + unsupportedApis.join('<br>');
		}
	},

    coordsToLatLng: function (coords)
    {
        return new google.maps.LatLng(
            coords.latitude || coords.Latitude,
            coords.longitude || coords.Longitude
        );
    },
    
    watchPosition: function ()
    {
        var geo_error = function () {
            alert("Sorry, no position available.");
        };
        
        var geo_options = {
            enableHighAccuracy: false, 
            maximumAge        : 0
        };
        
        navigator.geolocation.watchPosition(this.updatePosition.bind(this), geo_error, geo_options);
    },
    
    updatePosition: function (position)
    {
        this.buttons.location.removeClass('disabled');
        
        var latLng = app.coordsToLatLng(position.coords);
        
        if (!this.positionMarker){
            this.positionMarker = new google.maps.Marker({map: app.map});
            
            this.positionMarker.infoWindow = new google.maps.InfoWindow({
                content: 'Me'
            });
            
            google.maps.event.addListener(this.positionMarker, 'click', function (){
                this.infoWindow.open(this.map, this);
            });
        }
        
        this.positionMarker.setPosition(latLng);
    },
    
    showPosition: function ()
    {
        app.map.setCenter(app.positionMarker.getPosition());
        app.positionMarker.infoWindow.open(app.map, app.positionMarker);
    },
    
    initMap: function ()
    {
        google.maps.visualRefresh = true;
     
        var tampereCoords = {
            latitude: 61.49815,
            longitude: 23.76103
        };
        
        var mapOptions = {
			center: app.coordsToLatLng(tampereCoords),
			zoom: 14,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.LEFT_BOTTOM
            }
		};
		
        this.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        
        var styles = [
            {'featureType': 'transit', 'stylers': [{'visibility': 'off'}]},
            {'featureType': 'poi', 'stylers': [{'visibility': 'off'}]}
        ];

        this.map.setOptions({ styles: styles });
        
        this.initControls();
        
        io.connect().on('vehicleUpdate', this.updateVehicles.bind(this));
        
        google.maps.event.addListener(this.map, 'bounds_changed', this.fetchStops.bind(this));
        
        this.watchPosition();
    },
    
    initControls: function ()
    {
        var controls = $('<div class="btn-group-vertical"></div>');
        this.buttons = {
            busses: $('<button class="btn btn-default active">Loading...</button>').click(app.toggleBusses).appendTo(controls),
            //stops: $('<button class="btn btn-default disabled">Stops (under construction)</button>').click(app.toggleStops).appendTo(controls),
            location: $('<button class="btn btn-default disabled">My location</button>').click(app.showPosition).appendTo(controls)
        };
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controls[0]);        
    },
    
    fetchStops: function ()
    {
        if (this.fetchingStops){
            return;
        }
        
        this.fetchingStops = true;
        
        if (this.map.getZoom() < 17){
            for(var i = 0; i < this.stopMarkers.length; i++){
                this.stopMarkers[i].setMap(null);
            }
            this.stopMarkers = [];
            this.fetchingStops = false;
            return;
        }
        
        var bounds = this.map.getBounds(),
            ne = bounds.getNorthEast(),
            sw = bounds.getSouthWest(),
            bbox = [sw.lng(), sw.lat(), ne.lng(), ne.lat()].join(',');
        
        $.getJSON('stops/'+bbox, this.updateStops.bind(this));
    },
    
    updateStops: function (stops)
    {
        for(var i = 0; i < stops.length; i++){
            this.stopMarkers.push(new StopMarker({
                map: this.map,
                stop: stops[i]
            }));
        }
        this.fetchingStops = false;
    },
    
    updateVehicles: function (data)
    {
        this.buttons.busses.text('Busses');
        
        var vehicles = data.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity;
        
        if (this.showVehicles === false || this.updatingVehicles === true || !vehicles){
            return;
        }

        this.updatingVehicles = true;
        
        var bounds = this.map.getBounds();
        
        for(var i = 0; i < vehicles.length; i++)
        {
            var monitoredVehicleJourney = vehicles[i].MonitoredVehicleJourney,
                vehicleId = monitoredVehicleJourney.VehicleRef.value,
                latLng = this.coordsToLatLng(monitoredVehicleJourney.VehicleLocation);
            
            if (bounds.contains(latLng) === false){
                if (this.vehicles[vehicleId]){
                    this.vehicles[vehicleId].setMap(null); // clear vehicle marker from the map
                    delete this.vehicles[vehicleId];
                }
                continue;
            }
            
            if (this.vehicles[vehicleId]){
                this.vehicles[vehicleId].setPosition(latLng);
            }
            else{
                this.vehicles[vehicleId] = new BusMarker({
                    map: app.map,
                    monitoredVehicleJourney: monitoredVehicleJourney,
                    position: latLng
                });
            }
		}
        
        this.updatingVehicles = false;
    },
    
    toggleBusses: function (event)
    {
        app.buttons.busses.toggleClass('active');
        
        if (app.showVehicles === true){
            app.buttons.busses.text('Busses');
            app.showVehicles = false;
            app.removeVehicles();
        }
        else{
            app.buttons.busses.text('Loading...');
            app.showVehicles = true;
        }
    },
    
    toggleStops: function (event)
    {
    },
    
    removeVehicles: function ()
    {
        // clear old markers
        for(var i in this.vehicles){
            if (this.vehicles.hasOwnProperty(i)){
                this.vehicles[i].setMap(null);
            }
        }

        this.vehicles = {};
    },
    
    initModal: function ()
    {
        this.modal = $('#modal');
        this.departures = {
            title: $('h4', this.modal),
            info: $('i', this.modal),
            table: $('table', this.modal),
            tbody: $('tbody', this.modal),
            stopCode: ''
        };

        this.modal.modal({
            show: false
        });
        
        $('input[name=time_limit]', app.modal).on('change', this.loadDepartures.bind(this));
    },
    
    startMonitoring: function (event)
    {
        var stop = event.data.stop;
        this.departures.title.text(stop.code + ' ' + stop.name);
        this.modal.modal('show');
        this.departures.stopCode = stop.code;
        this.loadDepartures();
    },

    loadDepartures: function ()
    {
        this.departures.info.removeClass('hidden');
        this.departures.info.text('Loading...');
        this.departures.table.addClass('hidden');
        this.departures.tbody.empty();
        
        var timeLimit = $('input[name=time_limit]:checked', app.modal).val(),
            url = ['stop', this.departures.stopCode, timeLimit];
        
        $.getJSON(url.join('/'), this.renderDepartures.bind(this));
    },

    renderDepartures: function (data)
    {
        if (data[0].departures.length === 0){
            this.departures.info.text('No departures');
        }
        else{
            this.departures.info.addClass('hidden');
            this.departures.table.removeClass('hidden');
        }
        
        for(var i = 0; i < data[0].departures.length; i++){
            var departure = data[0].departures[i];
            var tr = $('<tr></tr>').appendTo(this.departures.tbody);
            var time = departure.time.substring(0, 2) + ':' + departure.time.substring(2);
            tr.append('<td>'+time+'</td>');
            tr.append('<td>'+departure.code+'</td>');
            tr.append('<td>'+departure.name1+'</td>');
        }
    }
};
