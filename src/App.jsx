var React = require('react'),
	Menu = require('./Menu.jsx'),
	MainView = require('./MainView.jsx'),
	MapComponent = require('./Map.jsx');

module.exports = React.createClass({
	render: function() {
		return (
			<div className="app">
			    <Menu views={['home', 'map']} activeView={this.props.activeView} />
			    <MainView activeView={this.props.activeView} position={this.props.position} />
			    <MapComponent activeView={this.props.activeView} coordinates={this.props.position.coords} />
		    </div>
		);
	}
});
