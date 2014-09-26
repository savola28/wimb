/** @jsx React.DOM */
var favoriteStorage = require('./favoriteStorage.js'),
	StopTimetable = require('./StopTimetable.jsx');

module.exports = React.createClass({
	getInitialState: function (){
		var favoriteStops = favoriteStorage.getAll('stops');
		return {
			favoriteStops: favoriteStops,
			activeStopCode: favoriteStops.length ? favoriteStops[0].code : ''
		};
	},
	
	render: function() {
		return (
			<div className="panel-group">
				{this.renderFavoriteStops()}
			</div>
		);
	},
	
	renderFavoriteStops: function (){
		if (this.state.favoriteStops.length){
			return this.state.favoriteStops.map(this.renderStop);
		}
		return 'You don\'t have favorite stops';
	},
	
	renderStop: function (stop, index) {
		var contentClassName = 'panel-collapse collapse',
			iconClassName = 'glyphicon glyphicon-chevron-',
			title;
		
		if (this.state.activeStopCode === stop.code){
			contentClassName += ' in';
			iconClassName += 'down';
			title = 'close';
		}
		else{
			iconClassName += 'up';
			title = 'open';
		}
		
		return (
			<div key={index} className="panel panel-default">
				<div className="panel-heading">
					<span className={iconClassName} title={title} data-stop-code={stop.code} onClick={this.toggleCollapse}></span> {stop.code} {stop.name}
				</div>
				<div className={contentClassName}>
					<StopTimetable stop={stop} renderOneDeparturePerLine={true} />
				</div>
			</div>
		);
	},
	
	toggleCollapse: function (event){
		var newActiveStopCode = $(event.currentTarget).attr('data-stop-code');
		if (this.state.activeStopCode === newActiveStopCode){
			newActiveStopCode = '';
		}
		this.setState({
			favoriteStops: this.state.favoriteStops,
			activeStopCode: newActiveStopCode
		});
	}
});
