
// import * as io from "socket.io-client"
// // var io = require('socket.io-client');


// var api_key 			= 'LLX0sjT8Bq67o297GXAwcTxvW';
// var currency_ids 	= '15,101,38,112,56,50,134';

// setTimeout(function(){
// 	socket_connection();
// },1500);


// var socket_re_conn,socket,heart_interval;

// var main_url 		= 'wss://fcsapi.com'; // web socket URL
// var backup_url		= 'wss://fxcoinapi.com'; // web socket backup URL
// var ws_url 			= main_url; // Web Socket
// export function socket_connection(){
// 	socket = io.connect(ws_url,{
// 	    transports: ['websocket'],
// 		path : "/v3/"
// 	});
// 	console.log("Connection Request send. Waiting response");
// 	socket.emit('heartbeat', api_key);
// 	socket.emit('real_time_join', currency_ids);
// 	socket.on('data_received',function(prices_data){
		
// 		console.log(" -------------- NEW ------------ "+prices_data.s);
// 		var temp = {};
// 		temp['Id']  			= prices_data.id;
// 		temp['Currency']  = prices_data.s; // Name, EUR/USD
// 		temp['Decimal']  	= prices_data.dp; // No of decimal in currency
// 		temp['Ask']  			= prices_data.a; // Ask price
// 		temp['Bid']  			= prices_data.b;
// 		temp['Open']  		= prices_data.lc; //Open price
// 		temp['High']  		= prices_data.h;
// 		temp['Low']  			= prices_data.l;
// 		temp['Close']  		= prices_data.c; // current or close price
// 		temp['Spread']  	= prices_data.sp;
// 		temp['Change']  	= prices_data.ch;
// 		temp['Chg_per']  	= prices_data.cp; // change percentage
		
// 		if(typeof prices_data.v === 'undefined')
// 			temp['Volume']  = 0;
// 		else
// 			temp['Volume']  = prices_data.v;

// 		temp['Time']  = prices_data.t;

// 		console.log(temp);

// 	});

// 	// real time join on successfully message return
// 	socket.on('successfully',(message)=>{
		

// 		console.log(message);
// 		console.log("Connect with URL "+ws_url);
// 		// auto re-connection destroy, when we connect with server
// 		if(socket_re_conn !== undefined)
// 			clearTimeout(socket_re_conn);
// 	});

// 	// disconnect with message return
// 	socket.on('disconnect',(message)=>{
// 		console.log(message);

// 		// when you'r disconnect,  auto re-connection after 15 minute 
// 		socket_re_connection();
// 	});

// 	// disconnect with message return
// 	socket.on('message',(message)=>{
// 		console.log(message);
// 	});

// 	// if connection error then connect with backup.
// 	socket.on('connect_error', function(e){
// 		// On error, socket will auto retry to connect, so we will wait 10 seconds before manully connect with backup
		
		

// 		console.log('Connection error. If you see this message for more then 15 minutes then contact us. ',e);
// 	});

// 	// heartbeat every hour 
// 	/* 
// 		You need to connect with server once per 24 hour, else your connection will be disconnect.
// 		Below we set heartbeat every hour, you can increase time upto 24 hours, 
// 		but do not decrease this time, beucase it will slow down your speed with server
// 	*/
// 	if(heart_interval !== undefined)
// 		clearTimeout(heart_interval);

// 	heart_interval = setInterval(function(){
// 		socket.emit('heartbeat', api_key);
// 	}, (1*60*60*1000)); // hour * minutes*seconds*1000; 

// }



// // exports.socket_connection=socket_connection 