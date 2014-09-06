var App = require('./App.jsx');

window.onhashchange = renderApp;

renderApp();

function renderApp(){
    var activeView = location.hash.substring(1) || 'home',
        title = activeView === 'home' ? '' : ' - ' + activeView;
    
    document.title = 'WIMB' + title;
    
    React.renderComponent(App({
        activeView: activeView
    }), document.body);
}
