var app = 
{
    map: null,
    
    geocoder: null,
    
    vehicles: {},
    
    showVehicles: true,
    
    updatingVehicles: false,
    
    currentLocationMarker: null,
    
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

    setCurrentLocation: function (button)
    {
        if (!this.currentLocationMarker){
            this.currentLocationMarker = new google.maps.Marker({
                animation: google.maps.Animation.DROP,
                icon: 'http://maps.google.com/mapfiles/marker_yellow.png'
            });
        }
        
        button.disabled = 'disable';
        
        navigator.geolocation.getCurrentPosition(
            function (pos){
                button.disabled = '';
                var latLng = this.coordsToLatLng(pos.coords);
                this.map.setCenter(latLng);
                this.currentLocationMarker.setMap(this.map);
                this.currentLocationMarker.setPosition(latLng);
            }.bind(this),
            function error(err) {
                throw err;
            },
            {
                maximumAge: 0 // don't use cached position
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
        var controls = document.createElement('div');
        controls.className = 'btn-group-vertical';
        controls.style.padding = '5px';
		controls.innerHTML += '<button onclick="app.toggleBusses(this);" class="btn btn-default btn-success">Busses</button>';
		controls.innerHTML += '<button onclick="app.toggleStops(this);" class="btn btn-default">Stops</button>';
		controls.innerHTML += '<button onclick="app.setCurrentLocation(this);" class="btn btn-default"><i class="glyphicon glyphicon-globe"></i>&nbsp;My location</button>';
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controls);        
    },
    
    updateVehicles: function (data)
    {
        if ( (this.showVehicles === false) || (this.updatingVehicles === true)){
            return;
        }
        
        this.updatingVehicles = true;
        
        var vehicles = data.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity;
        var newVehicles = {};
        
        for(var i = 0; i < vehicles.length; i++)
        {
            var vehicleId = vehicles[i].MonitoredVehicleJourney.VehicleRef.value,
                coords = vehicles[i].MonitoredVehicleJourney.VehicleLocation,
                latLng = this.coordsToLatLng(coords);
                
            if (this.vehicles[vehicleId]){
                var vehicle = this.vehicles[vehicleId];
                vehicle.marker.setPosition(latLng);
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
                    origin: vehicles[i].MonitoredVehicleJourney.OriginName.value,
                    destination: vehicles[i].MonitoredVehicleJourney.DestinationName.value
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
    
    toggleBusses: function (button)
    {
        if (app.showVehicles === true){
            app.showVehicles = false;
            button.className = 'btn btn-default';
            app.setVehicles({});
        }
        else{
            app.showVehicles = true;
            button.className = 'btn btn-default btn-success';
        }
    },
    
    toggleStops: function (button)
    {
        alert('Stops are under construction');
        button.disabled = 'disabled';
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