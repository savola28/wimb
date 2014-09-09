/** @jsx React.DOM */
var favoriteStorage = require('./favoriteStorage.js'),
	locale = 'fi',
	timeOptions = {hour: 'numeric', minute: 'numeric'};

moment.locale(locale);

module.exports = React.createClass({
	getInitialState: function() {
		if (favoriteStorage.get('stops', this.props.stop.code)){
			return {isFavorite: true};
		}
		return {isFavorite: false};
	},
	
	render: function() {
	    var departures = <i>No departures</i>;
	    
	    if (this.props.departures.length){
	        departures = this.renderDepartures();
	    }

        var iconClass = 'glyphicon glyphicon-star';
		if (!this.state.isFavorite){
			iconClass += '-empty';
		}

		return (
            <div>
                <button type="button" className="btn btn-default" onClick={this.toggleFavoriteStop}>
	    			<span className={iconClass}></span>
	    			{this.props.stop.code} {this.props.stop.name}
	    		</button>
                {departures}
            </div>
		);
	},
	
	renderDepartures: function (data){
		return (
			<table className="table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Line</th>
                    </tr>
                </thead>
                <tbody>
                	{this.props.departures.map(this.renderDeparture)}
                </tbody>
            </table>
        );
	},
	
	renderDeparture: function (departure, key){
    	var date = departureToDate(departure),
    		time = date.toLocaleTimeString(locale, timeOptions),
    		deltaTime = moment(date).fromNow();

    	return (
            <tr key={key}>
                <td title={time}>{deltaTime}</td>
                <td title={departure.name1}>{departure.code}</td>
    	    </tr>
    	);
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
    
    if (hours < 24){
    	return new Date(year + '-' + month + '-' + day + ' ' + hours + ':' + minutes);
    }
    
    hours = hours - 24;
    
    date = new Date(year + '-' + month + '-' + day + ' ' + hours + ':' + minutes);
    
    date.setDate(date.getDate() + 1);
	
	return date;
}
