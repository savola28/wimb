var React = require('react'),
	moment = require('moment'),
	favoriteStorage = require('./favoriteStorage.js');

var locale = 'fi',
	timeOptions = {hour: 'numeric', minute: 'numeric'};

moment.locale(locale);

module.exports = React.createClass({
	getInitialState: function() {
		return {
			isFavorite: favoriteStorage.exists('stops', this.props.stop.code),
			departures: this.props.departures || []
		};
	},
	
	componentDidMount: function() {
		$.getJSON('api', {
			request: 'stop',
			code: this.props.stop.code,
			dep_limit: 20,
			time_limit: 360
		}, function (stops) {
			this.setState({
				isFavorite: this.state.isFavorite,
				departures: stops[0].departures
			});
		}.bind(this));
	},
	
	render: function() {
		return (
			<div>
				{this.renderFavoriteToggler()}
				{this.renderLines()}
			</div>
		);
	},
	
	renderFavoriteToggler: function (){
		if (!this.props.enableFavoriteToggler){
			return '';
		}
		
		var iconClass = 'glyphicon glyphicon-star';
		if (!this.state.isFavorite){
			iconClass += '-empty';
		}
		
		return (
			<button type="button" className="btn btn-default" onClick={this.toggleFavoriteStop}>
				<span className={iconClass}></span>
				{this.props.stop.code} {this.props.stop.name}
			</button>
		);
	},
	
	renderLines: function (){
		if (!this.state.departures.length){
			return (<div className="panel-body">Loading...</div>);
		}
		
		var lines = getDeparturesByLines(this.state.departures);
		
		return (
			<table className="table borderless">
				{lines.map(this.renderLine)}
			</table>
		);
	},
	
	renderLine: function (line, index) {
		var startEnd = line.route.split(' - '),
			destination = startEnd[line.direction - 1];
		
		return (
			<tr key={index}>
				<th>{line.code} &rarr; {destination}</th>
				{line.departures.map(this.renderDeparture)}
			</tr>
		);
	},
	
	renderDeparture: function (departureDate, index){
		var time = departureDate.toLocaleTimeString(locale, timeOptions),
			totalMinutes = moment(departureDate).diff(moment(new Date()), 'minutes'),
			hours = Math.floor(totalMinutes / 60),
			minutes = totalMinutes % 60,
			hoursAndMinutes = [];
			
		if (hours > 0){
			hoursAndMinutes.push(hours + 'h');
		}
		
		if (minutes > 0 || hours === 0){
			hoursAndMinutes.push(minutes + 'min');
		}

		var className = (index > 0) ? 'hidden-xs': '';

		return (<td key={index} className={className} title={time}>{hoursAndMinutes.join(' ')}</td>);
	},
	
	toggleFavoriteStop: function (){
		if (this.state.isFavorite){
			favoriteStorage.remove('stops', this.props.stop.code);
			this.setState({isFavorite: false});
		}
		else{
			favoriteStorage.add('stops', this.props.stop.code, this.props.stop);
			this.setState({isFavorite: true});
		}
	}
});

function getDeparturesByLines(departures) {
	var lines = [],
		lineIds = {};
		
	for(var i = 0; i < departures.length; i++){
		var departure = departures[i],
			lineId = [departure.code, departure.name1, departure.direction].join(','),
			index = lineIds[lineId];
		
		if (typeof index !== 'number'){
			var line = {
				code: departure.code,
				route: departure.name1,
				direction: departure.direction,
				departures: []
			};
			index = lines.push(line) - 1;
			lineIds[lineId] = index;
		}
		
		var date = departureToDate(departure);
		
		lines[index].departures.push(date);
	}
	
	return lines;
}

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
