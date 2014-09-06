module.exports = {
    add: function(storage, id, value){
        var items = this.getAll(storage);
        items[id] = value || {};
        this._storeItems(storage, items);
    },
    
    remove: function(storage, id){
        var items = this.getAll(storage);
        delete items[id];
        this._storeItems(storage, items);
    },
    
    get: function(storage, id){
        var items = this.getAll(storage);
        return items[id];
    },
    
    getAll: function(storage){
        return JSON.parse(localStorage.getItem(storage)) || {};
    },
    
    _storeItems: function(storage, items){
        return localStorage.setItem(storage, JSON.stringify(items));
    }
};
