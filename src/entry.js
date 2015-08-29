var React = require('react'),
	App = require('./App.jsx');

function renderApp() {
	var activeView = location.hash.substring(1) || 'home',
		title = activeView === 'home' ? '' : ' - ' + activeView;

	document.title = 'WIMB' + title;

	var app = React.createElement(App, {
		activeView: activeView
	});

	React.render(app, document.body);
}

window.onhashchange = renderApp;

renderApp();
