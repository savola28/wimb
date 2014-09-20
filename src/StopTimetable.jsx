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
		var iconClass = 'glyphicon glyphicon-star';
		if (!this.state.isFavorite){
			iconClass += '-empty';
		}
		
		var lines = getDeparturesByLines(this.props.stop);
		
		return (
			<div>
				<button type="button" className="btn btn-default" onClick={this.toggleFavoriteStop}>
					<span className={iconClass}></span>
					{this.props.stop.code} {this.props.stop.name_fi}
				</button>
				<table className="table borderless">
					{lines.map(this.renderLine)}
				</table>
			</div>
		);
	},
	
	renderLine: function (line, index) {
		var startEnd = line.route.split(' - '),
			destination = startEnd[line.direction - 1],
			departures;
		
		if (this.props.renderOnlyOneDepartures){
			departures = this.renderDeparture(line.departures[0]);
		}
		else{
			departures = line.departures.map(this.renderDeparture);
		}
		
		return (
			<tr key={index}>
				<th>{line.code} &rarr; {destination}</th>
				{departures}
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

		return (<td key={index} title={time}>{hoursAndMinutes.join(' ')}</td>);
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

function getDeparturesByLines(stop) {
	var lines = [],
		lineIds = {};
		
	for(var i = 0; i < stop.departures.length; i++){
		var departure = stop.departures[i],
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
