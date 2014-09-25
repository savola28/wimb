/** @jsx React.DOM */
var favoriteStorage = require('../favoriteStorage.js');

module.exports =  React.createClass({
	getInitialState: function() {
		return {isFavorite: favoriteStorage.exists('lines', this.props.lineCode)};
	},
	
	render: function() {
		var iconClass = 'glyphicon glyphicon-star';
		if (!this.state.isFavorite){
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
		if (this.state.isFavorite){
			favoriteStorage.remove('lines', this.props.lineCode);
			this.setState({isFavorite: false});
		}
		else{
			favoriteStorage.add('lines', this.props.lineCode);
			this.setState({isFavorite: true});
		}
	}
});
