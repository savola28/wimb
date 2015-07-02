var React = require('react'),
	favoriteStorage = require('./favoriteStorage.js'),
	StopTimetable = require('./StopTimetable.jsx');

module.exports = React.createClass({
	render: function() {
		return (
			<div className="panel-group">
				{this.renderFavoriteStops()}
			</div>
		);
	},
	
	renderFavoriteStops: function (){
		var favoriteStops = favoriteStorage.getAll('stops');
		if (favoriteStops.length){
			return favoriteStops.map(this.renderStop);
		}
		return 'You don\'t have favorite stops';
	},
	
	renderStop: function (stop, index) {
		return (
			<div key={index} className="panel panel-default">
				<div className="panel-heading" onClick={this.toggleCollapse}>
					{stop.code} {stop.name}
				</div>
				<div className="panel-collapse collapse">
					<StopTimetable stop={stop} />
				</div>
			</div>
		);
	},
	
	toggleCollapse: function (event){
		var heading = $(event.currentTarget),
			content = heading.next();
		
		content.collapse('toggle');
	}
});
