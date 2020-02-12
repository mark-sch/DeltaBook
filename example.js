let DeltaBook = require("../DeltaBook");
let Orderbooks = new DeltaBook.OrderBookStore(10)
let symbol = "ETHUSDT"
const ccxt = require('ccxt');
const WebSocket = require('ws');

const ccxtClient = new ccxt.binance({
    urls :{
      api: { 
        fapiPublic: 'https://fapi.binance.com/fapi/v1',
        fapiPrivate: 'https://fapi.binance.com/fapi/v1'
      }
    },
    apiKey: '',
    secret: '',
    options: { defaultType: 'future', warnOnFetchOpenOrdersWithoutSymbol: false }
  });


async function getOBRestSnapshot(client, symbol) {
    let ob = await client.fetchOrderBook(symbol);
    return ob;
}


async function main() {
    console.time("OrderbookLoop")

    let ob = await getOBRestSnapshot(ccxtClient, symbol.replace('USDT', '/USDT'));
    console.log(ob);

    symbol = 'ETHUSDT'.toLowerCase();
    const ws = new WebSocket('wss://fstream.binance.com/stream');

    ws.onerror = function(e) {
      console.log(`Binance Futures: Public stream error: ${String(e)}`);
    };

    ws.onopen = function() {
      console.log('Binance Futures: Connection opened.');
      ws.send(
        JSON.stringify({
          method: 'SUBSCRIBE',
          params: [ symbol+'@depth@0ms' ],
          id: Math.floor(Math.random() * Math.floor(100))
        })
      );
    }

    ws.onmessage = async function(event) {
      if (event.type && event.type === 'message') {
        const data = JSON.parse(event.data);

        if (data.stream && data.stream.toLowerCase().includes('@depth')) {
          console.log(data.data.s, data.data.b, data.data.a);
          let asks = data.data.a.map(ask =>  { return {price: ask[0], size: ask[1]} } );
          let bids = data.data.b.map(bid =>  { return {price: bid[0], size: bid[1]} } );
          
          Orderbooks.updateOrderBook(data.data.s, asks, bids);
          console.log(Orderbooks.getOrderBook(data.data.s));
        }
      }
    }

    /*
    symbol = 'XTZ-PERP';
    var ws = new WebSocket('wss://ftx.com/ws/');
    ws.onopen = function() {
      console.log('FTX: Connection opened.');

      ws.send(JSON.stringify({ op: 'subscribe', channel: 'orderbook', market: symbol }));
    }

    ws.onmessage = async function(event) {
      if (event.type === 'message') {
        const data = JSON.parse(event.data);

        if (data.type === 'subscribed') {
          console.log(`FTX: subscribed to channel: ${data.channel} - ${event.data}`);
          return;
        }
        if (data.type === 'error') {
          console.log(`FTX: websocket error: ${JSON.stringify(data)}`);
          return;
        }

        if (data.channel === 'orderbook') {
          console.log('orderbook', data.market, data.data.bids);
          let asks = data.data.asks.map(ask =>  { return {price: ask[0], size: ask[1]} } );
          let bids = data.data.bids.map(bid =>  { return {price: bid[0], size: bid[1]} } );
          
          Orderbooks.updateOrderBook(data.market, asks, bids);
          console.log(Orderbooks.getOrderBook(symbol));
        }
      }
    }
    */
    
    
    console.timeEnd("OrderbookLoop")
}

main();