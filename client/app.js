var app = 
{
    map: null,
    
    geocoder: null,
    
    vehicles: {},
    
    showVehicles: true,
    
    updatingVehicles: false,
    
	start: function ()
	{
        try{
            this.isCoolBrowser();
            this.initLocation(this.initMap.bind(this));
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

    initLocation: function (callback)
    {
		this.geocoder = new google.maps.Geocoder();
		
		this.geocoder.geocode( { 'address': 'Tampere, Finland'}, function(results, status)
		{
            if (status !== google.maps.GeocoderStatus.OK){
                throw status;
            }
            
            callback(results[0].geometry.location);
        });
    },

    coordsToLatLng: function (coords)
    {
        return new google.maps.LatLng(
            coords.latitude || coords.Latitude,
            coords.longitude || coords.Longitude
        );
    },

    setCurrentLocation: function (event)
    {
        var currentLocationMarker = new google.maps.Marker({
            animation: google.maps.Animation.DROP
        });
        
        $(event.target).attr('disable', true);
        
        navigator.geolocation.getCurrentPosition(
            function (pos){
                var latLng = app.coordsToLatLng(pos.coords);
                app.map.setCenter(latLng);
                currentLocationMarker.setMap(app.map);
                currentLocationMarker.setPosition(latLng);
                setTimeout(function() {
                    currentLocationMarker.setMap(null);
                    $(event.target).removeAttr('disable');
                }, 1500);
            },
            function error(err) {
                throw err;
            }
        );
    },
    
    initMap: function (latLng)
    {
        google.maps.visualRefresh = true;
        
        var mapOptions = {
			center: latLng,
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
    },
    
    initControls: function ()
    {
        var controls = $('<div class="btn-group-vertical"></div>');
        $('<button class="btn btn-default btn-success">Busses</button>').click(app.toggleBusses).appendTo(controls);
        $('<button class="btn btn-default">Stops</button>').click(app.toggleStops).appendTo(controls);
		$('<button class="btn btn-default"><i class="glyphicon glyphicon-globe"></i>&nbsp;My location</button>').click(app.setCurrentLocation).appendTo(controls);
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controls[0]);        
    },
    
    updateVehicles: function (data)
    {
        if ( (this.showVehicles === false) || (this.updatingVehicles === true)){
            return;
        }
        
        this.updatingVehicles = true;
        
        var vehicles = data.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity,
            newVehicles = {},
            bounds = this.map.getBounds();
        
        for(var i = 0; i < vehicles.length; i++)
        {
            var vehicleId = vehicles[i].MonitoredVehicleJourney.VehicleRef.value,
                coords = vehicles[i].MonitoredVehicleJourney.VehicleLocation,
                latLng = this.coordsToLatLng(coords),
                origin = vehicles[i].MonitoredVehicleJourney.OriginName.value,
                destination = vehicles[i].MonitoredVehicleJourney.DestinationName.value;
            
            if (bounds.contains(latLng) === false){
                if (this.vehicles[vehicleId]){
                    this.vehicles[vehicleId].marker.setMap(null);
                    delete this.vehicles[vehicleId];
                }
            }    
            else if (this.vehicles[vehicleId]){
                var vehicle = this.vehicles[vehicleId];
                vehicle.marker.setPosition(latLng);
                vehicle.marker.origin = origin;
                vehicle.marker.destination = destination;
                newVehicles[vehicleId] = vehicle;
                delete this.vehicles[vehicleId];
            }
            else{
                var marker = new MarkerWithLabel({
                    map: this.map, 
                    position: latLng,
                    labelContent: vehicles[i].MonitoredVehicleJourney.LineRef.value,
                    labelAnchor: new google.maps.Point(6, 35),
                    labelClass: 'bus-markers',
                    labelInBackground: false,
                    origin: origin,
                    destination: destination
                });
                
                google.maps.event.addListener(marker, 'click', this.showBusDetails);
                
                newVehicles[vehicleId] = {marker: marker};
            }
		}
        
        this.setVehicles(newVehicles);
        
        this.updatingVehicles = false;
    },
    
    showBusDetails: function()
    {
        if (!this.infoWindow){
            this.infoWindow = new google.maps.InfoWindow({
                content: this.origin + ' &rarr; ' + this.destination
            });
        }
        this.infoWindow.open(this.map, this);
    },
    
    toggleBusses: function (event)
    {
        $(event.target).toggleClass('btn-success');
        if (app.showVehicles === true){
            app.showVehicles = false;
            app.setVehicles({});
        }
        else{
            app.showVehicles = true;
        }
    },
    
    toggleStops: function (event)
    {
        alert('Stops are under construction');
        $(event.target).attr("disabled", true);
    },
    
    setVehicles: function (vehicles)
    {
        // clear old markers
        for(var i in this.vehicles){
            if (this.vehicles.hasOwnProperty(i)){
                this.vehicles[i].marker.setMap(null);
            }
        }

        this.vehicles = vehicles;
    }
};