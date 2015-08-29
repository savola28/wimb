var React = require('react'),
	App = require('./App.jsx');

var position = null;

function renderApp(newPosition) {
	var activeView = location.hash.substring(1) || 'home',
		title = activeView === 'home' ? '' : ' - ' + activeView;

	document.title = 'WIMB' + title;

	if (newPosition) {
		position = newPosition;
	}

	var app = React.createElement(App, {
		activeView: activeView,
		position: position
	});

	React.render(app, document.body);
}

function renderWithoutPosition() {
	renderApp();
}

window.onhashchange = renderWithoutPosition;

if (!('geolocation' in navigator)) {
	renderWithoutPosition();
}
else {
	navigator.geolocation.getCurrentPosition(renderApp, renderWithoutPosition);
}
