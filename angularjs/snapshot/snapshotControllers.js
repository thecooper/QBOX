angular.module('snapshotModule')

	.controller('snapshotController', ['$scope','$timeout','booking','snapshotStatus','spotConfig',function($scope,$timeout,booking,snapshotStatus,spotConfig) {
		$scope.dailyDate = formatDate(new Date);
		$scope.weeklyDate = formatDate(new Date);
		$scope.bookingsList = [];
		$scope.edit = false;
		$scope.sortValue = "currentSpot";
		$scope.sortAsc = false;
		$scope.totalCash = 0;
		$scope.totalEftpos = 0;

		$scope.$on("booking_updated",function(onEvent){
			onEvent.stopPropagation();
			getDailyBookings();
		});

		$scope.$watch('dailyDate',function(){
			snapshotStatus.dailyDate = $scope.dailyDate;
			$scope.weeklyDate = $scope.dailyDate;
		});

		function calculateDailyDollars() {
			var cash=0,eftpos=0;
			$scope.bookingsList.forEach(function(booking){
				booking.payments.forEach(function(payment){
					if(formatDate(payment.payment_timestamp) == formatDate($scope.dailyDate)){
						if(payment.payment_type == "cash")
							cash+=parseFloat(payment.payment_amount);
						else
							eftpos+=parseFloat(payment.payment_amount);
					}
				});
			});
			$scope.totalCash = cash;
			$scope.totalEftpos = eftpos;
		}

		function getDailyBookings() {
			booking.all($scope.dailyDate,$scope.dailyDate,function(result){
				$scope.bookingsList = result.bookings.map(function(bking){
					return new Booking(bking);
				});
				$scope.bookingsList.forEach(function(bking){
					bking.currSpot($scope.dailyDate);
					bking.calculateDollarAmounts();
				});
				calculateDailyDollars();
				getWeeklyBookings();
			});
		}

		function getWeeklyBookings() {
			var weekout = formatDate((new Date($scope.weeklyDate)).getTime() + (timestampDay*7));
			//To ensure that snapshotStatus service has loaded before processing the weekly bookings
			if(snapshotStatus.spotConfig.length == 0){
				$timeout(getWeeklyBookings,1000);
				return;
			}
			booking.all($scope.weeklyDate,weekout,function(result){
				var weeklyBookings = result.bookings;
				var weeklyGrid = [];

				var parkableTotal = snapshotStatus.spotConfig.filter(function(spotcfg){
					return spotcfg.type.search("powered") > -1 || spotcfg.type.search("unpowered") > -1;
				}).length;

				var tentTotal = snapshotStatus.spotConfig.filter(function(spotcfg){
					return spotcfg.type.search("tent") > -1;
				}).length;
				for(var i = 0;i<7;i++){
					var currentDate = formatDate((new Date($scope.weeklyDate)).getTime()+(i*timestampDay));
					var currentParkable = weeklyBookings.filter(function(booking){
						return booking.spots.some(function(spot){
							return formatDate(spot.occupied_date) == formatDate(currentDate) &&
								(spot.type == "powered" || spot.type == "unpowered");
						})
					})
					var currentTent = weeklyBookings.filter(function(booking){
						return booking.spots.some(function(spot){
							return formatDate(spot.occupied_date) == formatDate(currentDate) &&
								spot.type == "tent";
						})
					})
					weeklyGrid[i] = {
						date:currentDate,
						parkable:parkableTotal - currentParkable.length,
						tent:tentTotal - currentTent.length
					};
				}
				$scope.weeklyGrid = weeklyGrid;
			});
		}

		$scope.editBooking = function(id) {
			var edit = $scope.bookingsList.filter(function(bkg) {
				return bkg.id === id;
			});
			if(edit.length < 1) {
				//throw error
			} else {
				snapshotStatus.currBooking = new Booking(edit[0]);
				$scope.edit = true;
				$scope.$broadcast('bookingEdit');
			}
		};


		$scope.newBooking = function() {
			snapshotStatus.currBooking = new Booking();
			// snapshotStatus.currBooking.check_in_date =
			$scope.$broadcast('bookingEdit');
			$scope.edit = true;
		};

		$scope.newReservation = function() {
			snapshotStatus.currBooking = new Booking();
			snapshotStatus.currBooking.booking_type = "New Reservation";
			$scope.$broadcast('bookingEdit');
			$scope.edit = true;
		};

		$scope.prevDay = function() {
			$scope.dailyDate = formatDate((new Date($scope.dailyDate)).getTime()-timestampDay);
			getDailyBookings();
		};
		$scope.nextDay = function() {
			$scope.dailyDate = formatDate((new Date($scope.dailyDate)).getTime()+timestampDay);
			getDailyBookings();
		};

		$scope.adjustWeekDate = function(direction) {
			if(direction == "forward") {
				$scope.weeklyDate = formatDate((new Date($scope.weeklyDate)).getTime()+timestampDay);
			} else {
				$scope.weeklyDate = formatDate((new Date($scope.weeklyDate)).getTime()-timestampDay);
			}
			getWeeklyBookings();
		}

		$scope.sortInHouse = function(col) {
			$scope.sortAsc = col==$scope.sortValue?!$scope.sortAsc:false;
			$scope.sortValue = col;
		};

		getDailyBookings();

		spotConfig.all(function(configSpots){
			snapshotStatus.spotConfig = configSpots;
		});
	}]);