console.log('SW running');

let staticName = 'static-v1';
let dynamicName = 'dynamic-v1';
let dbVersion = 5;
let cacheSize = 65;
let staticList = [
	'/',
	'/index.html',
	'./css/main.css',
	'./css/materialize.min.css',
	'./js/app.js',
  './manifest.json',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://fonts.gstatic.com/s/materialicons/v78/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
];
let dynamicList = [];

self.addEventListener('install', (ev) => {
	//install event - browser has installed this version
  console.log(`Version ${dbVersion} installed`);
    ev.waitUntil(
			caches
				.open(staticName)
				.then((cache) => {
					cache.addAll(staticList).then(
						() => {
							console.log(`${staticName} has been updated.`);
						},
						(err) => {
							console.warn(`failed to update ${staticName}.`);
						}
					);
				})
		);
});

self.addEventListener('activate', (ev) => {
	//activate event - browser now using this version
  console.log('activated');
   ev.waitUntil(
			caches.keys().then((keys) => {
				return Promise.all(
					keys
						.filter((key) => {
							if (key != staticName) {
								return true;
							}
						})
						.map((key) => caches.delete(key))
				).then((empties) => {
				});
			})
		);
});

self.addEventListener('fetch', (ev) => {
	//fetch event - web page is asking for an asset
});

self.addEventListener('message', ({ data }) => {
	//message received from a web page that uses this sw
});

const handleFetchResponse = (fetchResponse, request) => {
	let type = fetchResponse.headers.get('content-type');
		return caches.open(dynamicList).then((cache) => {
			cache.put(request, fetchResponse.clone());
			return fetchResponse;
		});
	
};

const sendMessage = async (msg) => {
	//send a message from the service worker to the webpage(s)
	let allClients = await clients.matchAll({ includeUncontrolled: true });
	return Promise.all(
		allClients.map((client) => {
			let channel = new MessageChannel();
			channel.port1.onmessage = onMessage;
			//port1 for send port2 for receive
			return client.postMessage(msg, [channel.port2]);
		})
	);
};

// const openDB = (callback) => {
// 	let req = indexedDB.open('movieDB', dbVersion);
// 	req.onerror = (err) => {
// 		//could not open db
// 		console.warn(err);
// 		DB = null;
// 	};
// 	req.onupgradeneeded = (ev) => {
// 		let db = ev.target.result;
//     let oldVersion = ev.oldVersion;
// 		let newVersion = ev.newVersion || db.version;
// 		console.log('DB updated from version', oldVersion, 'to', newVersion);
// 		if (!db.objectStoreNames.contains('movieStore')) {
// 			db.createObjectStore('movieStore', {
// 				keyPath: 'id',
// 			});
// 		}
// 	};
// 	req.onsuccess = (ev) => {
// 		DB = ev.target.result;
// 		console.log('db opened and upgraded as needed');
// 		if (callback) {
// 			callback();
// 		}

// 	};
// };