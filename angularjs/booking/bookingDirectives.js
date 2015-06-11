angular.module('bookingModule')
	.directive('booking',function(){
		return {
			templateUrl:'angularjs/booking/views/bookingEdit.htm',
			restrict:'E',
			require:'^ngModel',
			scope: {
				isOpen:"=ngShow"
			},
			controller: ['$scope','booking','payment','snapshotStatus',function($scope,booking,payment,snapshotStatus){
				$scope.paymentAmount = null;
				$scope.paymentType = null;
				$scope.editSpots = false;

				$scope.$on('bookingEdit',function(){
					$scope.booking = snapshotStatus.currBooking;
				});

				$scope.toggleSpotEdit = function() {
					$scope.editSpots = !$scope.editSpots;
				};

				$scope.closeEdit = function() {
					$scope.isOpen = false;
					$scope.editSpots = false;
				};

				$scope.$watch('booking.booking_type',function(newVal){
					if(!$scope.booking)
						return;
					switch($scope.booking.booking_type) {
						case "Booking":
							$scope.header = "Booking #" + $scope.booking.id;
							$scope.saveButtonText = "Update Booking";
							break;
						case "New Booking":
							$scope.header = "New Booking";
							$scope.saveButtonText = "Save Booking";
							break;
						case "Reservation":
							$scope.header = "Reservation #" + $scope.booking.id;
							$scope.saveButtonText = "Update Reservation";
							break;
						case "New Reservation":
							$scope.header = "New Reservation";
							$scope.saveButtonText = "Save Reservation";
							break;
					}
				});

				$scope.dateChanged = function() {
					$scope.booking.number_nights = (new Date($scope.booking.check_out_date) - new Date($scope.booking.check_in_date))/timestampDay;
					$scope.booking.calculateDollarAmounts();
					$scope.$broadcast('spot_change');
				};

				$scope.nightNumberChanged = function() {
					$scope.booking.check_out_date = formatDate((new Date($scope.booking.check_in_date).getTime())+(timestampDay*$scope.booking.number_nights))
					$scope.booking.calculateDollarAmounts();
				};

				$scope.copyBooking = function() {
					$scope.booking = new Booking($scope.booking);
					$scope.booking.id = null;
					$scope.booking.payments = [];
					$scope.booking.spots = [];
				}

				$scope.deletePayment = function(id,index) {
					if(id) {
						payment.delete(id,function(message) {
							if("Deleted" == message) {
								alert("Deleted successfully");
								$scope.booking.payments = $scope.booking.payments.filter(function(payment){
									return payment.id != id;
								})
							}
						});
					} else {
						$scope.booking.payments = $scope.booking.payments.filter(function(payment,i){
							return i != index;
						})
					}
					$scope.booking.calculateDollarAmounts();
				};
				$scope.addPayment = function() {
					$scope.booking.payments.push({payment_amount:$scope.paymentAmount,payment_type:$scope.paymentType,payment_timestamp:formatDate(new Date())});
					$scope.booking.calculateDollarAmounts();
					$scope.paymentType = null;
					$scope.paymentAmount = null;
				};
				$scope.save = function() {
					if($scope.booking.booking_type != "Reservation" || $scope.booking.booking_type != "New Reservation") {
						if ($scope.booking.spots.length < $scope.booking.number_nights) {
							$scope.editSpots = true;
						} else {
							booking.save($scope.booking,function(result){
								if(result.message === "Saved") {
									alert("Saved!!");
									$scope.isOpen = false;
									$scope.$emit("booking_updated");
								}
							});
						}
					}
				}

				$scope.cancelBooking = function() {
					if(window.confirm("Are you sure you want to cancel this booking?")) {
						$scope.booking.is_cancelled = true;
						$scope.save();
					}
				};
			}]
		}
	})
	.directive('spotgrid',function(){
		return {
			templateUrl:"angularjs/booking/views/spotDirective.htm",
			restrict:'EC',
			require:['^ngModel','^booking'],
			scope: {
				booking:"=ngModel",
				edit:"=ngShow"
			},
			controller:['$scope','snapshotStatus','spot',function($scope,snapshotStatus,spot){
				function buildDatesGrid() {
					$scope.dates = [];
					for(var i=0;i<$scope.booking.number_nights;i++) {
						$scope.dates = $scope.dates.concat({date:formatDate((new Date($scope.booking.check_in_date).getTime())+(i*timestampDay)),spots:[]});
					}
					$scope.dates.map(function(day) {
						var configSpots = [];

						var a = snapshotStatus.spotConfig.filter(function(spot){
							return spot.type.split(',').some(function(type){
								return type == $scope.booking.spot_type.toLowerCase();
							})
						});
						a.forEach(function(spot){
							configSpots = configSpots.concat({number:spot.number,type:spot.type});
						});

						day.spots = configSpots
						return day;
					});
					//check boxes that have been assigned to booking already

					$scope.booking.spots.forEach(function(assignedSpot){
						$scope.dates.forEach(function(day){
							if(formatDate(day.date) == formatDate(assignedSpot.occupied_date)) {
								day.spots.forEach(function(spot){
									if(spot.number == assignedSpot.number) {
										spot.id = assignedSpot.id;
										spot.booked = true;
									}
								})
							}
						})
					});

					//highlight spots that are already assigned
					spot.get($scope.booking.check_in_date,$scope.booking.check_out_date,function(dbSpots) {
						var spotsAssigned = dbSpots;
						spotsAssigned.forEach(function(assignedSpot){
							$scope.dates.forEach(function(day){
								if(formatDate(day.date) == formatDate(assignedSpot.occupied_date)) {
									day.spots.forEach(function(spot){
										if(spot.number == assignedSpot.number){
											spot.occupied = true;
										}
									});
								}
							});
						});
					});
				}
				$scope.$watch("edit",function(){
					if($scope.booking !== undefined) {
						if($scope.edit === true) {
							//Create dates array from *new* objects based on snapshotStatus.spotConfig service variable
							buildDatesGrid();
						}
					}
				});

				$scope.assignSpot = function(event,date,number,isOccupied) {
					if(event.target.localName === "input"){
						if(event.target.checked) {
							if($scope.booking.spots.some(function(spot){
								return formatDate(spot.occupied_date) == formatDate(date);
							})) {
								alert("Error: there is already a spot booked for this day.");
								event.target.checked = false;
								return;
							}
							if(isOccupied === true) {
								if(window.confirm("This spot has already been assigned to. Would you like to continue?")) {
									$scope.booking.spots = $scope.booking.spots.concat({occupied_date:date,number:number});
								} else {
									event.target.checked = false;
								}
							} else {
								$scope.booking.spots = $scope.booking.spots.concat({occupied_date:date,number:number,type:$scope.booking.spot_type.toLowerCase()});
								$scope.dates.map(function(day){
									if(formatDate(day.date) == formatDate(date)) {
										day.spots = day.spots.map(function(spot){
											if(spot.number == number)
												spot.booked = true;
											return spot;
										});
									}
									return day;
								});
							}
						} else {
							var deletedSpot = $scope.booking.spots.filter(function(spot){
								return formatDate(spot.occupied_date) == formatDate(date) && spot.number == number;
							})[0];

							if(deletedSpot.id) {
								if(window.confirm('Are you sure you want to unbook this spot?')) {
									spot.delete(deletedSpot.id,function(message){
										if(message == "Deleted") {
											event.target.checked = false;
											$scope.booking.spots = $scope.booking.spots.filter(function(spot){
												return spot.id !== deletedSpot.id;
											});
											buildDatesGrid();
											alert("Booking spot has been deleted!");
										}
									});
								} else {
									event.target.checked = true;
								}
							} else {
								$scope.booking.spots = $scope.booking.spots.filter(function(spots){
									return !(spots.occupied_date == date && parseInt(spots.number) == parseInt(number));
								});
								$scope.dates.map(function(day){
									if(formatDate(day.date) == formatDate(date)) {
										day.spots = day.spots.map(function(spot){
											if(spot.number == number)
												spot.booked = false;
											return spot;
										});
									}
									return day;
								});
							}
						}
					}
				}
			}]
		}
	})