var React = require('react'),
	FavoriteStops = require('./FavoriteStops.jsx');

module.exports = React.createClass({
	render: function() {
		var className = 'main-view container-fluid';
		
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
