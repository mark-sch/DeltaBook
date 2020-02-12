"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("DeltaBook");

test('OrderBookStore Memory limit Test', () => {
    let Orderbooks = new index_1.OrderBookStore(1000);
    let symbol = "BTCUSDT";
    let round = 1001;
    for (let i = 0; i < round; i++) {
        let asks = [{ price: 8000 + i, size: 2 * Math.random() }];
        let bids = [{ price: 6000 + i, size: 2 * Math.random() }];
        Orderbooks.updateOrderBook(symbol, asks, bids);
    }
    expect(Orderbooks.getOrderBook(symbol).ask.length).toBe(1000);
});
test('OrderBookStore Cleanup Test', () => {
    let Orderbooks = new index_1.OrderBookStore(1000);
    let symbol = "BTCUSDT";
    let round = 10000;
    for (let i = 0; i < round; i++) {
        let asks = [{ price: 100 * Math.random(), size: 2 * Math.random() }];
        let bids = [{ price: 100 * Math.random(), size: 2 * Math.random() }];
        Orderbooks.updateOrderBook(symbol, asks, bids);
    }
    Orderbooks.updateOrderBook(symbol, [{ price: 90, size: 2 }], [{ price: 90, size: 2 }]);
    Orderbooks.updateOrderBook(symbol, [{ price: 90, size: 2 }], [{ price: 90, size: 2 }]);
    Orderbooks.updateOrderBook(symbol, [{ price: 90, size: 2 }], [{ price: 90, size: 2 }]);
    let OrderBookResult = Orderbooks.getOrderBook(symbol);
    expect(OrderBookResult.best_bid.price == OrderBookResult.best_ask.price).toBe(true);
});
test('OrderBook Memory limit Test', () => {
    let symbol = "BTCUSDT";
    let SingleOrderbook = new index_1.Orderbook(symbol, 1000);
    let round = 1001;
    for (let i = 0; i < round; i++) {
        let asks = [{ price: 8000 + i, size: 2 * Math.random() }];
        let bids = [{ price: 6000 + i, size: 2 * Math.random() }];
        SingleOrderbook.updateOrderBook(asks, bids);
    }
    expect(SingleOrderbook.getOrderBook().ask.length).toBe(1000);
});
test('OrderBookCleanup Test', () => {
    let symbol = "BTCUSDT";
    let SingleOrderbook = new index_1.Orderbook(symbol, 1000);
    let round = 10000;
    for (let i = 0; i < round; i++) {
        let asks = [{ price: 100 * Math.random(), size: 2 * Math.random() }];
        let bids = [{ price: 100 * Math.random(), size: 2 * Math.random() }];
        SingleOrderbook.updateOrderBook(asks, bids);
    }
    SingleOrderbook.updateOrderBook([{ price: 90, size: 2 }], [{ price: 90, size: 2 }]);
    SingleOrderbook.updateOrderBook([{ price: 90, size: 2 }], [{ price: 90, size: 2 }]);
    SingleOrderbook.updateOrderBook([{ price: 90, size: 2 }], [{ price: 90, size: 2 }]);
    let OrderBookResult = SingleOrderbook.getOrderBook();
    expect(OrderBookResult.best_bid.price == OrderBookResult.best_ask.price).toBe(true);
});