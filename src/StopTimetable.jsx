/** @jsx React.DOM */
var favoriteStorage = require('./favoriteStorage.js');

module.exports = React.createClass({
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
                <table className="table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Line</th>
                        </tr>
                    </thead>
                    <tbody>{this.renderDepartures()}</tbody>
                </table>
            );
	    }
	    else{
	        content = <i>No departures</i>;
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
                {content}
            </div>
		);
	},
	
	renderDepartures: function (data){
        return this.props.departures.map(function(departure) {
        	var date = departureToDate(departure);

        	return (
                <tr key={date.toISOString() + departure.code}>
                    <td>{date.toLocaleTimeString('fi')}</td>
                    <td title={departure.name1}>{departure.code}</td>
        	    </tr>
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