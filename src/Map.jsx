var React = require('react'),
	vehicleMonitor = require('./map/vehicleMonitor.js');

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
			vehicleMonitor.start(this.getDOMNode(), this.props.coordinates);
		}
		else {
			vehicleMonitor.stop();
		}
	}
});
