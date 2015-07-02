var views = ['home', 'map'];

module.exports = React.createClass({
	render: function() {
		return (
			<div className="navbar navbar-fixed-top navbar-inverse" role="navigation">
			    <div className="container">
			        <div className="navbar-header">
			            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
			                <span className="icon-bar"></span>
			                <span className="icon-bar"></span>
			                <span className="icon-bar"></span>
			            </button>
			            <a className="navbar-brand" href="#">WIMB</a>
			        </div>
			        <div className="collapse navbar-collapse">
			            <ul className="nav navbar-nav">
			            	{this.renderItems()}
			            </ul>
			        </div>
			    </div>
			</div>
		);
	},
	
	renderItems: function (){
		return views.map(this.renderItem);
	},
	
	renderItem: function (viewId){
		var isActive = (this.props.activeView === viewId);
		
		return (<li key={viewId} className={isActive ? 'active' : ''}><a href={'#'+viewId} onClick={this.handleMenuClick}>{viewId}</a></li>);		
	},
	
	handleMenuClick: function (event){
		$('.navbar-collapse', this.getDOMNode()).collapse('hide');
	}
});
