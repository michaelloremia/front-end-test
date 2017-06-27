(function () {

	angular.module('QueueApp')
		.directive('queueTimer', QueueTimer);

    QueueTimer.$inject = ['$interval'];

	/**
	* The <customer> directive is responsible for:
	* - serving customer
	* - calculating queued time
	* - removing customer from the queue
	*/
	function QueueTimer($interval) {
		return {
			restrict: 'E',
			scope: {
				dateJoined: '=',
                dateServed: '=',
                isServed: '='
			},
			templateUrl: '/queueTimer/queueTimer.html',
			link: function (scope) {
                var dateStart = new Date(scope.dateJoined);
                var intervalTimer = null;
                updateTime();
                if(!scope.isServed) {
                    intervalTimer = $interval(updateTime, 1000);
                }

                function updateTime() {
                    var dateEnd = scope.isServed ? new Date(scope.dateServed) : new Date();
                    console.log(dateEnd);
                    // calculate how long the customer has queued for
                    var milliseconds = dateEnd - dateStart;
                    var seconds = Math.floor((milliseconds / 1000) % 60);
                    var minutes = Math.floor(((milliseconds / (1000*60)) % 60));
                    var hours   = Math.floor(((milliseconds / (1000*60*60)) % 24));
                    scope.queuedTime = Number(hours).toString().padStart(2, "0") + ':' + Number(minutes).toString().padStart(2, "0") + ':' + Number(seconds).toString().padStart(2, "0");
                }

                scope.$on('$destroy', function() {
                    if(!scope.isServed) {
                        $interval.cancel(intervalTimer);
                    }
                });

			}
		};
	}

})();
