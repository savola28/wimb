module.exports = {
	add: function(storageKey, id, item) {
		var storage = this.getStorage(storageKey),
			index = storage.items.push(item) - 1;
		storage.ids[id] = index;
		this.setStorage(storageKey, storage);
	},

	remove: function(storageKey, id) {
		var storage = this.getStorage(storageKey);
		storage.items.splice(storage.ids[id]);
		delete storage.ids[id];
		this.setStorage(storageKey, storage);
	},

	exists: function(storageKey, id) {
		var storage = this.getStorage(storageKey);
		return (typeof storage.ids[id] !== 'undefined');
	},

	get: function(storageKey, id) {
		var storage = this.getStorage(storageKey);
		return storage.items[storage.ids[id]];
	},

	getAll: function(storageKey) {
		var storage = this.getStorage(storageKey);
		return storage.items;
	},

	getStorage: function(key) {
		return JSON.parse(localStorage.getItem(key)) || {
			items: [],
			ids: {}
		};
	},

	setStorage: function(key, value) {
		return localStorage.setItem(key, JSON.stringify(value));
	}
};
