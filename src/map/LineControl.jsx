var React = require('react'),
	favoriteStorage = require('../favoriteStorage.js');

module.exports =  React.createClass({
	render: function() {
		if (this.props.lineCode){
			return this.renderLineButton();
		}
		
		return (
			<div className="alert alert-info" role="alert">Show line and stops by clicking a bus</div>
		);
	},
	
	renderLineButton: function (){
		var iconClass = 'glyphicon glyphicon-star';
		if (!favoriteStorage.exists('lines', this.props.lineCode)){
			iconClass += '-empty';
		}
		
		return (
		    <div className="btn-group">
	    		<button type="button" className="btn btn-default" onClick={this.toggleFavoriteLine}>
	    			<span className={iconClass}></span>
	    			{this.props.lineCode}
	    		</button>
	            <button type="button" className="btn btn-default" onClick={this.props.closeHandler}>
	                <span className="glyphicon glyphicon-remove"></span>
	            </button>
			</div>
		);
	},
	
	toggleFavoriteLine: function (){
		if (favoriteStorage.exists('lines', this.props.lineCode)){
			favoriteStorage.remove('lines', this.props.lineCode);
		}
		else{
			favoriteStorage.add('lines', this.props.lineCode);
		}
		this.forceUpdate();
	}
});
