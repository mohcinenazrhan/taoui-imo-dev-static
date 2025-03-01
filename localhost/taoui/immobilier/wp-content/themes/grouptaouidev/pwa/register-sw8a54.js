'use strict';
(function() {
	'use strict';
	// Variables & default values
	let _refreshing = false,
		_isOffline = false,
		_timeoutMsg = null,
		_config = null,
		_deferredPrompt,
		_msgHolder = null;

	// Functions helpers
	const isLocalhost = Boolean(
		/localhost/g.test(window.location.origin) ||
			window.location.hostname === 'localhost' ||
			// [::1] is the IPv6 localhost address.
			window.location.hostname === '[::1]' ||
			// 127.0.0.1/8 is considered localhost for IPv4.
			window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
	);

	const _cacheName = 'MNAZ-cache-1'; // The value has to be the same as the one in the service worker
	const devOrigin = 'http://localhost/taoui/immobilier'; // Dev origin for local test
	const origin = isLocalhost ? devOrigin : location.origin; // origin of the url
	const themeName = 'grouptaouidev'; // wordpress theme name

	/****************** Config Service Worker script ******************/

	// Config documentation
	/*
		msgSwInstalled: show this message when service worker installed | Type: String
		msgOffline: show this message when user goes offline | Type: String
		msgOnline: show this message when user back online | Type: String
		msgWhenUpdate: show this message when the content of the visited page has changed | Type: String
		msgIosA2HSPrompt: show this message if is IOS device to show how to A2HS | Type: String,
		msgAndroidA2HSPrompt: show this message if is Android device for A2HS | Type: String,
		msgToShowWhenAppInstalled: msg to show when the app/site is installed | Type: String,
		installBtnText: text of botton install | Type: String,
		laterBtnText: text of botton later | Type: String,
		askUserWhenSwUpdated: ask user when service worker changed to apply the change | Type: Boolean | Values: (true || false)
		askUserWhenContentChange: ask user when content changed to apply the change | Type: Boolean | Values: (true || false)
		classIdBtnSwUpdate: specify the class / id name of the button that appears when SW change | Type: String
		msgWhenSwUpdated: show this message when service worker changed | Type: String
		cacheStrategy: strategy for caching assets | Type: String | Values: (onReload || preCache)
		msgSWUnsupported: show this message when service worker unsupported by the browser | Type: String
		offlinePage: 'the page that will be served as fallback if visit a page that is not cached yet',
		pagesToCache: give a list of pages you want to cache for the first load | Type: Array
	*/

	// Default values, change it in the object configuration below
	/*
		msgSwInstalled: 'You can access the visited pages while offline.',
		msgOffline: 'You\'re currently offline',
		msgOnline: 'You\'re back online <a href="javascript:location.reload()">refresh</a>',
		msgWhenUpdate: 'The contents of this page have been updated. Please <a href="javascript:location.reload()">reload</a>',
		msgIosA2HSPrompt: 'To install this site on your iPhone / iPad, press share <shareImgHtml>, then on <addHomeScreenImgHtml> add to the home screen.',
		msgAndroidA2HSPrompt: 'Add to the home screen',
		installBtnText: 'Install',
		laterBtnText: 'Later',
		msgToShowWhenAppInstalled: 'Thank you for installing our app!',
		askUserWhenSwUpdated: false,
		askUserWhenContentChange: false,
		classIdBtnSwUpdate: 'btn-updatesw',
		msgWhenSwUpdated: 'New version available online. Do you want to update? <button class="classIdBtnSwUpdate" id="classIdBtnSwUpdate">Yes</button>',
		cacheStrategy: 'preCache', // strategy for pre-caching assets : onReload | preCache
		msgSWUnsupported: 'Your browser does not support serviceworker. the app will not be available offline.',
		offlinePage: '/',
		pagesToCache: []
	*/

	const config = {
		msgSwInstalled: 'Vous pouvez accéder aux pages visitées en mode hors connexion.',
		msgOffline: 'Vous êtes actuellement hors ligne.',
		msgOnline: 'Vous êtes de retour en ligne <a href="javascript:location.reload()">actualiser</a> la page',
		msgWhenUpdate:
			'Le contenu de cette page a été changé. Veuillez <a href="javascript:location.reload()">actualiser</a> la page',
		msgIosA2HSPrompt:
			"Pour installer ce site sur votre iPhone/iPad, appuyez sur <shareImgHtml>, puis sur <addHomeScreenImgHtml> ajouter à l'écran d'accueil.",
		msgAndroidA2HSPrompt: "Ajouter à l'écran d'accueil",
		installBtnText: 'Installer',
		laterBtnText: 'Plus tard',
		msgToShowWhenAppInstalled: "Merci d'avoir installé notre site!",
		askUserWhenSwUpdated: false,
		askUserWhenContentChange: true,
		msgWhenSwUpdated:
			'Nouvelle version disponible en ligne. Voulez-vous mettre à jour?  <button class="classIdBtnSwUpdate" id="classIdBtnSwUpdate">Oui</button>',
		cacheStrategy: 'preCache', // strategy for caching assets : onReload | preCache
		msgSWUnsupported:
			"Votre navigateur ne supporte pas PWA, l'application ne sera pas disponible hors connexion, veuillez utiliser la dernière version de Chrome.",
		swUrl: `${origin}/wp-content/themes/${themeName}/pwa/sw/sw.php`,
		offlinePage: `${origin}/offline-page`,
		pagesToCache: [ '/', origin, `${origin}/` ]
	};

	/****************** Start : Fire Service Worker script ******************/

	window.addEventListener('load', function() {
		configSW(config);
		injectSwMsgHtml();
		injectSwMsgCss();

		showNetworkStateToUser();

		if (!('serviceWorker' in navigator)) {
			showMsg(_config.msgSWUnsupported);
			return;
		}

		serviceWorkerRegistration().then(() => {
			listenToSWMessages();
			installPromptManager();
			checkAssetsUpdate();
		});
	});

	/****************** End : Fire Service Worker script ******************/

	/****************** Start : Functions Service Worker script ******************/
	/**
	 * Config Script
	 * @param {*} config 
	 */
	function configSW(config) {
		_config = Object.assign(
			{},
			{
				msgSwInstalled: 'You can access the visited pages while offline.',
				msgOffline: "You're currently offline",
				msgOnline: 'You\'re back online <a href="javascript:location.reload()">refresh</a>',
				msgWhenUpdate:
					'The contents of this page have been updated. Please <a href="javascript:location.reload()">reload</a>',
				msgIosA2HSPrompt:
					'To install this site on your iPhone / iPad, press share <shareImgHtml>, then on <addHomeScreenImgHtml> add to the home screen.',
				msgAndroidA2HSPrompt: 'Add to the home screen',
				installBtnText: 'Install',
				laterBtnText: 'Later',
				msgToShowWhenAppInstalled: 'Thank you for installing our app!',
				askUserWhenSwUpdated: false,
				askUserWhenContentChange: false,
				classIdBtnSwUpdate: 'btn-updatesw',
				msgWhenSwUpdated:
					'New version available online. Do you want to update?  <button class="classIdBtnSwUpdate" id="classIdBtnSwUpdate">Yes</button>',
				cacheStrategy: 'preCache', // strategy for pre-caching assets : onReload | preCache
				msgSWUnsupported: 'Your browser does not support serviceworker. the app will not be available offline.',
				offlinePage: '/',
				pagesToCache: []
			},
			config
		);
	}

	/**
	 * Inject html to show sw messages to the user
	 */
	function injectSwMsgHtml() {
		const container = document.createElement('div');
		container.className = 'snackbar';

		const parag = document.createElement('p');
		parag.id = 'msgOffline';
		container.appendChild(parag);

		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'snackbar-close';
		button.setAttribute('aria-label', 'snackbar-close');
		button.addEventListener('click', hideMsg);
		button.innerHTML = '&times;';

		container.appendChild(button);

		document.body.appendChild(container);

		window.addEventListener('online', showNetworkStateToUser);
		window.addEventListener('offline', showNetworkStateToUser);

		container.addEventListener('mouseover', function() {
			if (_timeoutMsg !== null) clearTimeout(_timeoutMsg);
		});
		container.addEventListener('mouseout', function() {
			if (_timeoutMsg !== null) _timeoutMsg = setTimeout(hideMsg, 2000);
		});
	}

	/**
	 * Inject style css for SW messaages
	 */
	function injectSwMsgCss() {
		const css = `body.snackbar--show .snackbar {
					-webkit-transform: translateY(0);
					transform: translateY(0); 
				}

				.snackbar {
					box-sizing: border-box;
					background-color: #121213;
					color: #fff;
					padding: 10px 55px 10px 10px;
					position: fixed;
					z-index: 9999999999999999;
					left: 15px;
					bottom: 15px;
					border-radius: 5px 8px 8px 5px;
					max-width: 90%;
					min-height: 48px;
					line-height: 28px;
    			font-size: 16px;
					-webkit-transform: translateY(150%);
					transform: translateY(150%);
					will-change: transform;
					-webkit-transition: -webkit-transform 200ms ease-in-out;
					-webkit-transition-delay: 0s;
							transition-delay: 0s;
					-webkit-transition: -webkit-transform 200ms ease-in-out false;
					transition: -webkit-transform 200ms ease-in-out false;
					transition: transform 200ms ease-in-out false;
					transition: transform 200ms ease-in-out false, -webkit-transform 200ms ease-in-out false;
					box-shadow: 0 7px 18px rgba(0,0,0,.2);
				}

				.snackbar p {
					margin: 0;
					color: #fff;
					text-align: center; 
				}

				.snackbar .snackbar-close {
					position: absolute;
					top: 0;
					right: 0;
					width: 45px;
					height: 100%;
					padding: 0;
					background: #dbb11c;
					border: none;
					font-size: 28px;
					font-weight: normal;
					border-radius: 0 5px 5px 0;
					color: #FFF;
					font-family: Arial, Helvetica, sans-serif;
				}

				.snackbar .snackbar-close:hover,
				.snackbar .snackbar-close:focus {
					background: #ddb728;
				}

				.snackbar a {
					color: #FFF;
					font-weight: bold;
					text-decoration: underline; 
				}

				.snackbar button {
					font-size: 14px;
				}

				.snackbar .btn-container {
					margin-top: 10px;
					display: block;
				}

				@media only screen and (min-width: 736px) {
					.snackbar .btn-container {
						margin-top: 0;
						display: inline-block;
					} 
				}

				.snackbar .btn-updatesw,
				.snackbar .btn-install {
					background: #ffffff;
					color: #000;
					font-weight: bold;
					border: none;
					border-radius: 5px; 
					margin: 0 10px;
					min-width: 48px;
    			min-height: 48px;
				}
				
				.snackbar .btn-install--cancel {
					background: #252222;
    			color: #fff;
					font-weight: bold;
					border: none;
					border-radius: 5px; 
					margin: 0 10px;
					min-width: 48px;
    			min-height: 48px;
				}
				
				.snackbar .img-icon {
					background-color: #fff;
					max-width: 35px;
					height: auto;
					border-radius: 2px;
					margin: 0 10px;
				}`,
			head = document.head || document.getElementsByTagName('head')[0],
			style = document.createElement('style');

		style.type = 'text/css';
		if (style.styleSheet) {
			// This is required for IE8 and below.
			style.styleSheet.cssText = css;
		} else {
			style.appendChild(document.createTextNode(css));
		}

		head.appendChild(style);
	}

	/**
	 * Show the Network State to the user : onLine | OffLine
	 */
	function showNetworkStateToUser() {
		if (navigator.onLine) {
			if (_isOffline === true) {
				showMsg(_config.msgOnline);
			}
			_isOffline = false;
		} else {
			showMsg(_config.msgOffline);
			_isOffline = true;
		}
	}

	/**
	 * Show the given message in the snackbar
	 * @param {String} msg 
	 * @param {Number} timeToHide // in milliseconds
	 * @param {Boolean} priority
	 * @param {Function} callback
	 */
	function showMsg(msg = '', timeToHide = 4500, priority = true, callback = null) {
		if (msg === '') return;

		if (priority === false && document.body.classList.contains('snackbar--show')) {
			_msgHolder = { msg, timeToHide, priority, callback };
			return;
		}

		document.getElementById('msgOffline').innerHTML = msg;
		document.body.classList.add('snackbar--show');

		if (callback !== null) callback();

		if (_timeoutMsg !== null) clearTimeout(_timeoutMsg);
		if (timeToHide !== null) _timeoutMsg = setTimeout(hideMsg, timeToHide);
		else _timeoutMsg = null;
	}

	/**
	 * Hide snackbar
	 */
	function hideMsg() {
		document.body.classList.remove('snackbar--show');

		setTimeout(() => {
			if (_msgHolder !== null) {
				const { msg, timeToHide, priority, callback } = _msgHolder;
				showMsg(msg, timeToHide, priority, callback);
				_msgHolder = null;
			}
		}, 400);
	}

	/**
	 * Unregister the service worker
	 */
	function unregisterSW() {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.ready.then((registration) => {
				registration.unregister();
			});
		}
	}

	/**
	 * Service worker registration & Update Process
	 */
	function serviceWorkerRegistration() {
		// If the Service Worker URL not specified in the _config object
		if (!_config.swUrl || _config.swUrl.trim() === '') {
			console.log('The Service Worker URL not specified in the config object, please make sure to do it.');
			return;
		}

		// listen for the controlling service worker changing
		// and reload the page
		if (_config.cacheStrategy === 'onReload') {
			navigator.serviceWorker.addEventListener('controllerchange', function() {
				if (_refreshing) return;

				window.location.reload();
				_refreshing = true;
			});
		}

		return navigator.serviceWorker
			.register(_config.swUrl, {
				scope: '/'
			})
			.then(function(reg) {
				console.log('Service Worker Registered');
				console.log('MNPWA service worker ready');

				// if there's no controller, this page wasn't loaded
				// via a service worker, so they're looking at the latest version.
				// In that case, exit early
				if (!navigator.serviceWorker.controller) {
					console.log('Service Worker installed');

					showMsg(_config.msgSwInstalled);

					if (reg.installing) sendConfigToSW(reg.installing);

					if (_config.cacheStrategy === 'preCache') {
						const urlsToCache = getAllCssJsImgFromPage().concat(_config.pagesToCache);
						urlsToCache.push(_config.offlinePage);
						urlsToCache.push(window.location.href);
						addToCache(urlsToCache);
					}

					return;
				}

				// if there's an updated worker already waiting, call
				// updateReady()
				if (reg.waiting) {
					updateReady(reg.waiting);
					return;
				}

				// if there's an updated worker installing, track its
				// progress. If it becomes "installed", call
				// updateReady()
				if (reg.installing) {
					trackingprogressInstalled(reg.installing);
					return;
				}

				// otherwise, listen for new installing workers arriving.
				// If one arrives, track its progress.
				// If it becomes "installed", call
				// updateReady()
				reg.addEventListener('updatefound', function() {
					trackingprogressInstalled(reg.installing);
				});
			})
			.catch((error) => {
				console.log('Service worker not registered: ', error);
				/* setting a retry function to retry sw registration */
				let attempts = 1;
				(function retry() {
					attempts *= 2;
					setTimeout(serviceWorkerRegistration, attempts * 60 * 1000);
				})();
			});
	}

	/**
	 * Update notification Service Worker
	 * @param {Object} worker
	 */
	function updateReady(worker) {
		if (_config.askUserWhenSwUpdated) {
			showMsg(_config.msgWhenSwUpdated.replace(/classIdBtnSwUpdate/g, _config.classIdBtnSwUpdate), null);

			document.getElementById(_config.classIdBtnSwUpdate).addEventListener(
				'click',
				(function(_updateSW, _cacheStrategy, _hideMsg) {
					return function() {
						_updateSW(worker);
						// hide notification bar if the user click Yes
						_hideMsg();
						// reload page if preCache not onReload to avoid reload page two times
						if (_cacheStrategy !== 'onReload') window.location.reload();
					};
				})(updateSW, _config.cacheStrategy, hideMsg)
			);

			return;
		}

		// if _askUserWhenSwUpdated is false just apply to updateSW
		updateSW(worker);
	}

	/**
	 * update SW by send message to sw for skip waiting
	 */
	function updateSW(worker) {
		worker.postMessage({
			action: 'skipWaiting'
		});
	}

	/**
	 * Update notification & Traking Service Worker
	 * @param {Object} worker 
	 */
	function trackingprogressInstalled(worker) {
		worker.addEventListener('statechange', () => {
			if (worker.state == 'installed') {
				updateReady(worker);
			}
		});
	}

	/**
	 * get All Css Js Img From Page for precache assets
	 */
	function getAllCssJsImgFromPage() {
		let arr = [];

		// Get all CSSStyleSheet
		for (CSSStyleSheet of document.styleSheets) {
			if (
				CSSStyleSheet.href !== null &&
				CSSStyleSheet.href.match(/^(http|https):\/\//i) &&
				new URL(CSSStyleSheet.html).origin === location.origin
			)
				arr.push(CSSStyleSheet.href);
		}

		// Get all Images
		for (let image of document.images) {
			if (
				image.src !== null &&
				image.src.match(/^(http|https):\/\//i) &&
				new URL(image.html).origin === location.origin
			)
				arr.push(image.src);
		}

		// Get all scripts
		for (let script of document.scripts) {
			if (
				script.src !== null &&
				script.tagName === 'SCRIPT' &&
				script.src !== '' &&
				script.src.match(/^(http|https):\/\//i) &&
				new URL(script.html).origin === location.origin
			)
				arr.push(script.src);
		}

		return arr;
	}

	/**
	 * Add to cache the given list of pages
	 */
	function addToCache(urls) {
		if (urls.length === 0) return;

		return window.caches.open(_cacheName).then(function(cache) {
			urls.map(function(url) {
				return cache.add(url).catch(function(reason) {
					return console.log('MNAZ-PWA: ' + String(reason) + ' ' + url);
				});
			});
		});
	}

	/**
	 * Send messages from client to Service Worker
	 * @param {*} msg 
	 */
	function send_message_to_sw(msg) {
		return new Promise(function(resolve, reject) {
			// Create a Message Channel
			var msg_chan = new MessageChannel();

			// Handler for recieving message reply from service worker
			msg_chan.port1.onmessage = function(event) {
				if (event.data.error) {
					reject(event.data.error);
				} else {
					resolve(event.data);
				}
			};

			// Send message to service worker along with port for reply
			navigator.serviceWorker.controller.postMessage(msg, [ msg_chan.port2 ]);
		});
	}

	/**
	 * Send message from client to Service worker to check if assets update
	 */
	function checkAssetsUpdate() {
		if (navigator.serviceWorker.controller && _config.askUserWhenContentChange === true)
			send_message_to_sw('checkAssetsUpdate');
	}

	/**
	 * Handler for messages coming from the service worker
	 */
	function listenToSWMessages() {
		navigator.serviceWorker.addEventListener('message', function(event) {
			if (event.data === 'reloadThePageForMAJ' && _config.askUserWhenContentChange === true)
				showMsg(_config.msgWhenUpdate);
		});
	}

	/**
	 * send Config ToSW
	 */
	function sendConfigToSW(regInstalling) {
		regInstalling.postMessage({
			action: 'config',
			config: {
				askUserWhenContentChange: _config.askUserWhenContentChange,
				offlinePage: _config.offlinePage,
				cacheName: _cacheName
			}
		});
	}

	/**
	 * Add To Home Screen
	 */
	function addToHomeScreen() {
		hideMsg();
		_deferredPrompt.prompt(); // Wait for the user to respond to the prompt
		_deferredPrompt.userChoice.then(function(choiceResult) {
			if (choiceResult.outcome === 'accepted') {
				console.log('User accepted the A2HS prompt');
			} else {
				console.log('User dismissed the A2HS prompt');
				delayA2HSprompt();
			}
			_deferredPrompt = null;
		});
	}

	/**
	 * Delay A2HSprompt By given nbr of day(s)
	 */
	function delayA2HSprompt(days = 2) {
		// Set Local Storage A2HSprompt value
		// current date + 2 days
		let dt = new Date();
		dt.setDate(dt.getDate() + days);
		localStorage.setItem('A2HSpromptFutureDate', dt);
	}

	/**
	 * Check if A2HSprompt's delay locally stored is expired
	 */
	function isA2HSpromptDelayExpired() {
		return new Date(localStorage.getItem('A2HSpromptFutureDate')) <= new Date();
	}

	/**
 	 * Check if A2HSprompt's delay locally stored is expired
 	 */
	function cancelA2HSprompt() {
		document.getElementById('cancel-btn').addEventListener('click', function() {
			delayA2HSprompt();
			hideMsg();
		});
	}

	/**
	 * Show Add To Home Screen
	 */
	function showAddToHomeScreen() {
		const buttons = `<button class="btn-install" id="install-btn">${_config.installBtnText}</button>
		<button class="btn-install--cancel" id="cancel-btn">${_config.laterBtnText}</button>`;
		const content = `${_config.msgAndroidA2HSPrompt} <div class="btn-container">${buttons}</div>`;
		showMsg(content, null, false, function() {
			document.getElementById('install-btn').addEventListener('click', addToHomeScreen);
			cancelA2HSprompt();
		});

		// Show a msg to let the user know that the app is successfully installed
		window.addEventListener('appinstalled', () => {
			showMsg(_config.msgToShowWhenAppInstalled, null, false);
		});
	}

	/**
	 * Detects if site run into a iOS device
	 */
	function isIos() {
		const userAgent = window.navigator.userAgent.toLowerCase();
		return /iphone|ipad|ipod/.test(userAgent);
	}

	/**
	 * Detects if device is in standalone mode
	 */
	function isInStandaloneMode() {
		return 'standalone' in window.navigator && window.navigator.standalone;
	}

	/**
	 * Install prompt manager for all devices
	 */
	function installPromptManager() {
		// Checks if should display install popup notification for iOS
		if (isIos()) {
			if (!isInStandaloneMode() && isA2HSpromptDelayExpired()) {
				const shareImgHtml = `<img class="img-icon" src="%24%7borigin%7d/wp-content/themes/%24%7bthemeName%7d/pwa/ios-share-icon.html">`;
				const addHomeScreenImgHtml = `<img class="img-icon" src="%24%7borigin%7d/wp-content/themes/%24%7bthemeName%7d/pwa/ios-add-new-icon.html">`;
				const button = `<div class="btn-container"><button class="btn-install" id="install-btn">Ok</button>
		<button class="btn-install--cancel" id="cancel-btn">${_config.laterBtnText}</button>`;

				const msgContent =
					_config.msgIosA2HSPrompt
						.replace('<shareImgHtml>', shareImgHtml)
						.replace('<addHomeScreenImgHtml>', addHomeScreenImgHtml) + button;

				showMsg(msgContent, null, false, function() {
					document.getElementById('install-btn').addEventListener('click', hideMsg);
					cancelA2HSprompt();
				});
			}
		} else {
			listenToInstallPrompt();
		}
	}

	/**
	 * listen To Install Prompt
	 */
	function listenToInstallPrompt() {
		window.addEventListener('beforeinstallprompt', function(e) {
			// Prevent Chrome 67 and earlier from automatically showing the prompt
			e.preventDefault();
			// Stash the event so it can be triggered later.
			_deferredPrompt = e;

			if (!_isOffline && isA2HSpromptDelayExpired()) showAddToHomeScreen();
		});
	}

	/****************** End : Functions Service Worker script ******************/
})();
