/** @jsx React.DOM */
var Menu = require('./Menu.jsx'),
	MainView = require('./MainView.jsx'),
	MapComponent = require('./Map.jsx');

module.exports = React.createClass({
	render: function() {
		return (
			<div className="app">
			    <Menu views={['home', 'map']} activeView={this.props.activeView} />
			    <MainView activeView={this.props.activeView} />
			    <MapComponent activeView={this.props.activeView} />
		    </div>
		);
	}
});
