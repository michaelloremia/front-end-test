var uuid =  require('node-uuid');
var serveStatic = require('node-static');
var fileServer = new serveStatic.Server('./public');
var express = require('express');
var bodyParser = require('body-parser');

var customers = [
	{ id: uuid.v4(), name: 'William Shakespeare', product: { name: 'Grammatical advice' }, joinedTime: new Date().toString() },
	{ id: uuid.v4(), name: 'Sherlock Holmes', product: { name: 'Magnifying glass repair' }, joinedTime: new Date().toString() },
	{ id: uuid.v4(), name: 'Alan Turing', product: { name: 'Cryptography advice' }, joinedTime: new Date().toString() }
];

var servedCustomers = [];
var openConnections = [];

function serveCustomer(id) {
	// always serve the first in the queue
	if (customers.length === 0) {
		console.log("All customer has been served, customer queue is empty");
		return 'All customer has been served!';
	}

	var _servedCustomer = customers.shift();
	servedCustomers.push(_servedCustomer);
	return 'Customer was served!';
}

function addCustomer(customer) {
	customer.id = uuid.v4();
	customer.joinedTime = new Date().toString();
	customers.push(customer);
}

function removeCustomer(targetCustomerId) {
	customers = customers.filter(function (customer) {
		return customer.id !== targetCustomerId;
	});
}

function constructSSE(data, event = 'queueUpdate') {
	openConnections.forEach(function(res) {
		res.write('id: ' + uuid.v4() + '\n');
		res.write('event: ' + event + '\n');
		res.write("data: " + JSON.stringify(data) + '\n\n');
	});
}

function sendQueueUpdate() {
	constructSSE({customers, servedCustomers}, 'queueUpdate');
}

function queueStreamEnd(res) {
	openConnections = openConnections.filter(function(_res) {
		return res !== _res;
	});
	res.end();
}

var app = express();
var queueConnection;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api/customers', function (req, res) {
	res.send(customers);
});
app.get('/api/customers/served', function (req, res) {
	res.send(servedCustomers);
});
app.post('/api/customer/add', function (req, res, next) {
	if (req.body.name && req.body.product && req.body.product.name) {
		addCustomer(req.body);
		sendQueueUpdate();
		res.type("text/plain");
		res.end('Customer was added!');
		return;
	}
	next({error: {message: 'Missing required field!'}});
});
app.put('/api/customer/serve', function (req, res) {
	var customerStatus = serveCustomer();
	sendQueueUpdate();
	res.end(customerStatus);
});
app.delete('/api/customer/remove', function (req, res) {
	removeCustomer(req.query.id);
	sendQueueUpdate();
	res.type("text/plain");
	res.end('Customer was removed!');
});

app.get('/api/queue-stream', function (req, res) {
	// req.socket.setTimeout(Infinity);
	res.writeHead(200, {
      'Connection': 'keep-alive',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    });

	res.write('\n');
	openConnections.push(res);
	constructSSE({connection: 1, customers, servedCustomers}, 'connection');

	req.on('close', function() {
		queueStreamEnd(res);
	});
});

app.use(function (req, res) {
	req.addListener('end', function () {
		fileServer.serve(req, res);
	}).resume();
});

app.use(function (err, req, res, next) {
	if (!err.error) {
		next(err); //let it pass, not known
	}
	error = err.error;
	console.error(error.message);
  	res.status(500).send(error.message);
});

app.listen(1337);
console.log('Server is running @ 127.0.0.1:1337...');
console.log('Good luck!');
