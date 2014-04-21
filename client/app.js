var app = 
{
    map: null,
    
    vehicles: {},
    
    showVehicles: true,
    
    updatingVehicles: false,
    
    buttons: null,
    
	start: function ()
	{
        try{
            this.isCoolBrowser();
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
        
        this.initControls();
        
        io.connect().on('vehicleUpdate', this.updateVehicles.bind(this));
        
        google.maps.event.addListener(this.map, 'bounds_changed', this.updateStops.bind(this));
        
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
    
    updateVehicles: function (data)
    {
        this.buttons.busses.text('Busses');
        
        var vehicles = data.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity;
        
        if (this.showVehicles === false || this.updatingVehicles === true || !vehicles){
            return;
        }

        this.updatingVehicles = true;
        
        var newVehicles = {},
            bounds = this.map.getBounds();
        
        for(var i = 0; i < vehicles.length; i++)
        {
            var vehicleId = vehicles[i].MonitoredVehicleJourney.VehicleRef.value,
                coords = vehicles[i].MonitoredVehicleJourney.VehicleLocation,
                latLng = this.coordsToLatLng(coords),
                origin = vehicles[i].MonitoredVehicleJourney.OriginName.value,
                destination = vehicles[i].MonitoredVehicleJourney.DestinationName.value,
                route = {origin: origin, destination: destination};
            
            if (bounds.contains(latLng) === false){
                if (this.vehicles[vehicleId]){
                    this.removeVehicle(vehicleId);
                }
                continue;
            }
            
            var marker = null;
            
            if (this.vehicles[vehicleId]){
                marker = this.vehicles[vehicleId];
                marker.setPosition(latLng);
                marker.setRoute(route);
                delete this.vehicles[vehicleId];
            }
            else{
                marker = new BusMarker({
                    map: app.map,
                    content: vehicles[i].MonitoredVehicleJourney.LineRef.value,
                    position: latLng,
                    route: route
                });
            }
            
            newVehicles[vehicleId] = marker;
		}
        
        this.setVehicles(newVehicles);
        
        this.updatingVehicles = false;
    },
    
    toggleBusses: function (event)
    {
        app.buttons.busses.toggleClass('active');
        
        if (app.showVehicles === true){
            app.buttons.busses.text('Busses');
            app.showVehicles = false;
            app.setVehicles({});
        }
        else{
            app.buttons.busses.text('Loading...');
            app.showVehicles = true;
        }
    },
    
    toggleStops: function (event)
    {
    },
    
    setVehicles: function (vehicles)
    {
        // clear old markers
        for(var i in this.vehicles){
            if (this.vehicles.hasOwnProperty(i)){
                this.vehicles[i].setMap(null);
            }
        }

        this.vehicles = vehicles;
    },
    
    removeVehicle: function (id)
    {
        this.vehicles[id].setMap(null); // clear vehicle marker from the map
        delete this.vehicles[id];
    },
    
    updateStops: function ()
    {
        console.log(this.map.getBounds());
    }
};
