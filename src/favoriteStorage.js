module.exports = {
    add: function(storageKey, id, item){
        var storage = this._getStorage(storageKey),
            index = storage.items.push(item) - 1;
        storage.ids[id] = index;
        this._setStorage(storageKey, storage);
    },
    
    remove: function(storageKey, id){
        var storage = this._getStorage(storageKey);
        storage.items.splice(storage.ids[id]);
        delete storage.ids[id];
        this._setStorage(storageKey, storage);
    },
    
    get: function(storageKey, id){
        var storage = this._getStorage(storageKey);
        return storage.items[storage.ids[id]];
    },
    
    getAll: function (storageKey){
        var storage = this._getStorage(storageKey);
        return storage.items;
    },
    
    _getStorage: function(key){
        return JSON.parse(localStorage.getItem(key)) || {items: [], ids: {}};
    },
    
    _setStorage: function(key, value){
        return localStorage.setItem(key, JSON.stringify(value));
    }
};
