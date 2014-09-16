var App = require('./App.jsx');

window.onhashchange = renderApp;
		
if (!("geolocation" in navigator)) {
	renderApp();
}
else {
    navigator.geolocation.getCurrentPosition(renderApp, renderApp);
}

function renderApp(position){
    var activeView = location.hash.substring(1) || 'home',
        title = activeView === 'home' ? '' : ' - ' + activeView;
    
    document.title = 'WIMB' + title;
    
    React.renderComponent(App({
        activeView: activeView,
        position: position
    }), document.body);
}
