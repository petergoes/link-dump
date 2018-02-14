import App from './components/App.html';

var app = new App({
	target: document.body,
	store,
});

export default app;

if ('serviceWorker' in navigator && !/localhost/.test(window.location.href)) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js')
			.then(registration => {
				console.log('SW registered: ', registration);
			})
			.catch(registrationError => {
				console.log('SW registration failed: ', registrationError);
			});
	});
}
