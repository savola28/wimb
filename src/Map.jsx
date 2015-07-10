var React = require('react'),
	map = require('./map/map.js');

module.exports = React.createClass({
	render: function () {
		var className = 'map-canvas';
		
		if (this.props.activeView !== 'map'){
			className += ' hidden';
		}
		
		return (
			<div className={className}></div>
		);
	},
	
	componentDidMount: function () {
		this.tryToActivate();
	},
	
	componentDidUpdate: function (){
		this.tryToActivate();
	},
	
	tryToActivate: function (){
		if (this.props.activeView === 'map'){
			map.show(this.getDOMNode(), this.props.coordinates);
		}
		else {
			map.hide();
		}
	}
});
