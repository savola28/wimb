/** @jsx React.DOM */
var FavoriteStops = require('./FavoriteStops.jsx');

module.exports = React.createClass({
	render: function() {
		var className = 'container-fluid';
		
		if (this.props.activeView !== 'home'){
			className += ' hidden';
		}
		
		return (
			<div className={className}>
				<FavoriteStops key="favoriteStops" />
			</div>
		);
	}
});
