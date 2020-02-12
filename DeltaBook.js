const updateIndex = (sortedArray, item, index, memory_limit = 0) => {
    item.size = Number(item.size);
    item.price = Number(item.price);
    if (index < sortedArray.length && Number(sortedArray[index].price) === item.price) {
        if (item.size === 0) {
            sortedArray.splice(index, 1);
        }
        else {
            sortedArray[index].size = item.size;
        }
    }
    else if (item.size !== 0) {
        sortedArray.splice(index, 0, item);
    }
    if (memory_limit !== 0 && sortedArray.length > memory_limit) {
        sortedArray.splice(memory_limit, sortedArray.length - memory_limit);
    }
    return index === 0;
};
const getSortedIndex = (array, value, inverse = false) => {
    let low = 0;
    let high = array ? array.length : low;
    while (low < high) {
        const mid = (low + high) >>> 1;
        if ((!inverse && +array[mid].price < +value) || (inverse && +array[mid].price > +value)) {
            low = mid + 1;
        }
        else {
            high = mid;
        }
    }
    return low;
};
const cleanOrderbookBid = (array, order) => {
    for (let i = 0; i < array.length; i++) {
        if (order.price < array[i].price) {
            array.splice(i, 1);
        }
        else {
            return i;
        }
    }
};
const cleanOrderbookAsk = (array, order) => {
    for (let i = 0; i < array.length; i++) {
        if (order.price > array[i].price) {
            array.splice(i, 1);
        }
        else {
            return i;
        }
    }
};
const processOrderbookUpdate = (data, ask, bid, memory_limit) => {
    for (const order of ask) {
        updateIndex(data.ask, order, getSortedIndex(data.ask, order.price, false), memory_limit);
        if (order.price < data.best_bid.price && order.size !== 0) {
            cleanOrderbookBid(data.bid, order);
        }
        data.best_ask = data.ask[0] || {};
        data.best2_ask = data.ask[0] && data.ask[1] ? { price: data.ask[1].price, size: data.ask[0].size + data.ask[1].size } : {};
    }
    for (const order of bid) {
        updateIndex(data.bid, order, getSortedIndex(data.bid, order.price, true), memory_limit);
        if (order.price > data.best_ask.price && order.size !== 0) {
            cleanOrderbookAsk(data.ask, order);
        }
        data.best_bid = data.bid[0] || {};
        data.best2_bid = data.bid[0] && data.bid[1] ? { price: data.bid[1].price, size: data.bid[0].size + data.bid[1].size } : {};
    }
    data.best_ask = data.ask[0] || {};
    data.best_bid = data.bid[0] || {};
    data.best2_ask = data.ask[0] && data.ask[1] ? { price: data.ask[1].price, size: data.ask[0].size + data.ask[1].size } : {};
    data.best2_bid = data.bid[0] && data.bid[1] ? { price: data.bid[1].price, size: data.bid[0].size + data.bid[1].size } : {};
    return data;
};


class OrderBookStore {
    constructor(memory_limit = 0) {
        this._data = {};
        this._data = {};
        this.memory_limit = memory_limit;
        this._symbols = [];
    }
    getOrderBook(symbol) {
        return this._data[symbol];
    }
    snapshotOrderBook(symbol, ask, bid) {
        this._data[symbol] = {
            ask: [],
            bid: [],
            best_ask: {},
            best_bid: {},
            best2_ask: {},
            best2_bid: {}
        };
        this.updateOrderBook(symbol, ask, bid);
        this._symbols.push(symbol);
    }
    updateOrderBook(symbol, ask, bid) {
        const memory_limit = this.memory_limit;
        const data = this._data[symbol];
        if (typeof data == "undefined") {
            this.snapshotOrderBook(symbol, ask, bid);
            return;
        }
        if (data) {
            processOrderbookUpdate(data, ask, bid, memory_limit);
        }
    }
}
exports.OrderBookStore = OrderBookStore;


class Orderbook {
    constructor(symbol = "none", memory_limit = 0) {
        this._data = {
            ask: [],
            bid: [],
            best_ask: {},
            best_bid: {},
            best2_ask: {},
            best2_bid: {}
        };
        this.symbol = symbol;
        this.memory_limit = memory_limit;
    }
    getOrderBook() {
        return this._data;
    }
    updateOrderBook(ask, bid) {
        const memory_limit = this.memory_limit;
        const data = this._data;
        processOrderbookUpdate(data, ask, bid, memory_limit);
    }
}
exports.Orderbook = Orderbook;