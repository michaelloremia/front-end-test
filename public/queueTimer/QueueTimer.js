(function () {

	angular.module('QueueApp')
		.directive('queueTimer', QueueTimer);

	/**
	* The <customer> directive is responsible for:
	* - serving customer
	* - calculating queued time
	* - removing customer from the queue
	*/
	function QueueTimer($http) {
		return {
			restrict: 'E',
			scope: {
				dateJoined: '=',
			},
			templateUrl: '/queueTimer/queueTimer.html',
			link: function (scope) {

				// calculate how long the customer has queued for
				var milliseconds = new Date() - new Date(scope.dateJoined);
                var seconds = Math.floor((milliseconds / 1000) % 60);
                var minutes = Math.floor(((milliseconds / (1000*60)) % 60));
                var hours   = Math.floor(((milliseconds / (1000*60*60)) % 24));
                scope.queuedTime = hours + ':' + minutes + ':' + seconds;

			}
		};
	}

})();
