(function () {

	angular.module('QueueApp')
		.directive('addCustomer', AddCustomer);

	AddCustomer.$inject = ['$http'];

	function AddCustomer($http) {
		return {
			restrict: 'E',
			scope: {
				onAdded: '&'
			},
			templateUrl: '/add-customer/add-customer.html',
			link: function (scope) {

				scope.products = [
					{ name: 'Grammatical advice' },
					{ name: 'Magnifying glass repair' },
					{ name: 'Cryptography advice' }
				];

				scope.addCustomer = function () {
					$http.post('/api/customer/add', {
						name: scope.name,
						product: scope.product
					}).then(function () {
						scope.onAdded();
					});
				};

			}
		}
	};

})();
