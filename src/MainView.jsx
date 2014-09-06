/** @jsx React.DOM */
module.exports = React.createClass({
	render: function() {
		var className = 'main-view';
		
		if (this.props.activeView !== 'home'){
			className += ' hidden';
		}
		
		return (
			<div className={className}>Hello seppo</div>
		);
	}
});
