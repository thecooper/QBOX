var app = angular.module("app", ['ngRoute','snapshotModule']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            redirectTo: '/snapshot',
        })
        .when('/snapshot', {
            controller: 'snapshotController',
            templateUrl: 'snapshot.htm'
        })
        .otherwise({
            redirectTo: '/snapshot'
        });
});

function formatDate(date) {
    var d;
    if (typeof date == "Date") {
        d = date;
    } else if (isNaN(date)) {
        //parse Date from string
        d = new Date(Date.parse(date));
    } else {
        //create Date object from timestamp
        d = new Date(date);
    }
    return (d.getMonth() + 1) + '/' + (d.getDate()) + '/' + (d.getFullYear());
}

var timestampDay = (1000 * 3600 * 24);
var booking = angular.module('bookingModule',['ngResource']);
angular.module('snapshotModule',['ngResource','bookingModule']);
var Booking = function(booking) {

        this.paymentsTotal = function() {
            var total = 0;
            this.payments.forEach(function(payment) {
                total += (!isNaN(payment.payment_amount) ? parseInt(payment.payment_amount) : 0);
            }, 0);
            return total;
        };

        this.currSpot = function(date) {
            this.currentSpot = this.spots.filter(function(spot){
                return formatDate(spot.occupied_date) == formatDate(date);
            })[0].number;
        }

        this.calculateDollarAmounts = function() {
        	//TODO: create service for configuration
            var DefaultDailyRate = 15,//$scope.DefaultDailyRate,
                total, DailyRate, WeeklyRate;

            var numWeeks = Math.floor(this.number_nights / 7);
            var nightsDaily = this.number_nights % 7;

            if (this.number_people == 1) {
                if (this.spot_type == "Powered") {
                    DailyRate = 25;
                    WeeklyRate = 150;
                } else {
                    DailyRate = 22;
                    WeeklyRate = 132;
                }
            } else {
                if (this.spot_type == "Powered") {
                    DailyRate = (DefaultDailyRate * this.number_people) + 5;
                    WeeklyRate = (this.number_people * 6 * 15)+30;
                } else {
                    DailyRate = DefaultDailyRate * this.number_people;
                    WeeklyRate = this.number_people * 6 * 15;
                }
            }

            if (this.keep_weekly) {
                total = (DailyRate * this.number_nights);
            } else {
                total = (numWeeks * WeeklyRate) + (DailyRate * nightsDaily);
            }

            this.amount_per_night = DailyRate;
            this.amount_total = total;
            this.amount_paid = this.paymentsTotal();
            var currentDay = Date.parse(formatDate(new Date())) >= Date.parse(this.check_out_date) ? formatDate(Date.parse(this.check_out_date) - timestampDay) : formatDate(new Date());
            var currentDayNum = ((Date.parse(currentDay) - Date.parse(this.check_in_date)) / timestampDay) + 1;
            var amount_owed = DailyRate * currentDayNum - parseInt(this.paymentsTotal());
            if (amount_owed < 0) {
                this.amount_owed = 0;
            } else {
                this.amount_owed = amount_owed;
            }

            if (this.amount_paid == this.amount_total)
                this.is_paid = true;
            else
                this.is_paid = false;

        };

        this.toggleWeeklyStay = function() {
            if (this.is_weekly) {
                this.number_nights = 1;
                this.is_weekly = false;
            } else {
                this.number_nights = 7;
                this.is_weekly = true;
            }
            this.calculateDollarAmounts()
        };

        this.copy = function(booking) {
            this.id = booking.id;
            this.booking_type = booking.booking_type;
            this.spot_type = booking.spot_type;
            this.name = booking.name;
            this.type = booking.type;
            this.registration = booking.registration;
            this.country = booking.country;
            this.number_nights = booking.number_nights;
            this.number_people = booking.number_people;
            this.email = booking.email;
            this.phone_number = booking.phone_number;
            this.amount_total = booking.amount_total;
            this.amount_per_night = booking.amount_per_night;
            this.amount_paid = booking.amount_paid;
            this.amount_owed = booking.amount_owed;
            this.check_in_date = booking.check_in_date;
            this.check_out_date = booking.check_out_date;
            this.payLater = booking.payLater;
            this.is_paid = booking.is_paid;
            this.payments = booking.payments;
            this.spots = booking.spots;
            this.notes = booking.notes;
            this.is_cancelled = booking.is_cancelled;
            this.preferred_spot = booking.preferred_spot;
            this.choose_spot = booking.choose_spot;
            this.is_weekly = booking.is_weekly;

            this.calculateDollarAmounts();
        };

        this.id = null;
        this.booking_type = "New Booking";
        this.spot_type = "Unpowered";
        this.name = "";
        this.type = "";
        this.registration = "";
        this.country = "";
        this.number_nights = 1;
        this.number_people = 2;
        this.email = "";
        this.phone_number = "";
        this.amount_total = 30;
        this.amount_per_night = 30;
        this.amount_paid = 0;
        this.amount_owed = 30;
        this.check_in_date = formatDate(new Date());
        this.check_out_date = formatDate((new Date(this.check_in_date)).getTime()+timestampDay);
        this.payLater = false;
        this.is_paid = false;
        this.payments = [];
        this.spots = [];
        this.notes = "";
        this.is_cancelled = false;
        this.preferred_spot = 0;
        this.choose_spot = false;
        this.is_weekly = false;

        if (booking != null && typeof booking !== undefined)
            this.copy(booking);
    };

function Reservation() {
	this.id = null;
	this.booking_type = 'New Reservation';
	this.number_people = 2;
	this.number_nights = 1;
	this.check_in_date = formatDate(new Date());
	this.check_out_date = formatDate((new Date(this.check_in_date)).getTime() + timestampDay);
}

function Spot(spot) {
    this.id = undefined;
    this.number = null;
    this.occupied_date = null;
    this.booking_id = null;

    if(spot) {
        this.id = spot.id;
        this.number = spot.number;
        this.occupied_date = spot.occupied_date;
        this.booking_id = spot.booking_id;
    }
}

function SpotConfig(SptCfg) {
    this.spots = [];
    if(SptCfg) {
        this.date = SptCfg.date;
        this.spots = SptCfg.spots;
    }
}
booking.service('booking',['$resource',function($resource){
	this.all = function(startDate,endDate,callback) {
		var Bookings,obj;
		if(startDate && endDate) {
			Bookings = $resource('api/booking.json?startDate=:startDate&endDate=:endDate');
			obj = {startDate:startDate,endDate:endDate};
		} else {
			Bookings = $resource('api/booking.json');
			obj={};
		}
		Bookings.get(obj,function(data){
			callback(data);
		});
	};
	this.get = function(id,callback) {
		var Booking = $resource('api/booking/:id.json');
		Booking.get({id:id},function(data){
			callback(data);
		})
	};
	this.save = function(booking,callback) {
		var Booking = $resource('api/booking/:id.json',{id:'@id'});
		Booking.save(booking,function(data){
			callback(data);
		});
	};
	this.delete = function(id,callback) {
		var Booking = $resource('api/booking/:id.json');
		Booking.delete({id:id},function(result){
			callback(result.message);
		});
	};
}]);

booking.service('spot',['$resource',function($resource){
	this.get = function(startDate,endDate,callback) {
		var Spot = $resource('api/spot.json?startDate=:startDate&endDate=:endDate');
		var obj = {}

		if(startDate&&endDate){
			obj = {startDate:startDate,endDate:endDate};
		}

		Spot.get(obj,function(result){
			callback(result.spots.map(function(spot){
				return spot.Spot;
			}));
		});
	};

	this.delete = function(id, callback) {
		var Spot = $resource('api/spot/:id.json');
		Spot.delete({id:id},function(result){
			callback(result.message);
		})
	};
}]);

booking.service('payment',['$resource',function($resource){
	this.delete = function(id,callback) {
		if(window.confirm("Are you sure you want to delete this payment?")){
			var Payment = $resource('api/payment/:id.json',{id:id});
			Payment.delete({},function(data) {
				callback(data.message);
			});
		}
	};
}]);
angular.module('snapshotModule')
	.value('snapshotStatus',{
		dailyDate:formatDate(new Date()),
		currBooking:{},
		edit: false,
		spotConfig:{}
	})
	.service('spotConfig',['$resource',function($resource){
		this.all = function(callback){
			var config = $resource('api/spotConfig.json');
			config.get({},function(result){
				callback(result.spotConfigs.map(function(spot){
					return spot.spotConfig;
				}));
			});
		};
	}]);
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