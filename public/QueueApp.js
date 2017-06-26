
	angular.module('QueueApp', [])
		.controller('QueueController', QueueController);

	QueueController.$inject = ['$scope', '$http', '$timeout'];

	/**
	* Bonus points - manipulating the without waiting for the
	* server request
	*/
	function QueueController($scope, $http, $timeout) {

		var _this = this;
		_this.customers = [];
		_this.servedCustomers = [];

		var queueConnection = _connectQueue();

		queueConnection.addEventListener('connection', _connectionHandler, false);
		queueConnection.addEventListener('queueUpdate', _updateQueue, false);

		_this.serveCustomer = _serveCustomer;

		function _updateQueue(res) {
			console.log('Queue updated!');
			var initialData = JSON.parse(res.data);
			$timeout(function() {
				_this.customers = initialData.customers;
				_this.servedCustomers = initialData.servedCustomers;
			});
		}

		function _connectionHandler(res) {
			var initialData = JSON.parse(res.data);
			console.log(initialData, _this);
			if (initialData.connection) {
				_updateQueue(res);
			}
		}

		function _getServedCustomers() {
			return $http.get('/api/customers/served').then(function (res) {
				_this.servedCustomers = res.data;
			});
		}

		function _getCustomers() {
			return $http.get('/api/customers').then(function (res) {
				_this.customers = res.data;
			});
		}

		function _serveCustomer () {
			return $http.put('/api/customer/serve');
		}

		function _connectQueue () {
			return new EventSource('/api/queue-stream');
		}

	}
