//TODO: update functions so that "this" can be used properly
var app = angular.module("booking_entry", ['ngRoute']);

var timestampDay = (1000 * 3600 * 24);

var Payment = function(type, amount) {
    this.type = type == null ? "" : type;
    this.amount = amount == null ? "" : amount;
    this.sequence = -1;
    this.status = "new";
    this.editing = false;
    this.timestamp = formatDateTime(new Date());
};

// Prevent the backspace key from navigating back.
$(document).unbind('keydown').bind('keydown', function(event) {
    var doPrevent = false;
    if (event.keyCode === 8) {
        var d = event.srcElement || event.target;
        if ((d.tagName.toUpperCase() === 'INPUT' &&
                (
                    d.type.toUpperCase() === 'TEXT' ||
                    d.type.toUpperCase() === 'PASSWORD' ||
                    d.type.toUpperCase() === 'FILE' ||
                    d.type.toUpperCase() === 'EMAIL' ||
                    d.type.toUpperCase() === 'SEARCH' ||
                    d.type.toUpperCase() === 'DATE')
            ) ||
            d.tagName.toUpperCase() === 'TEXTAREA') {
            doPrevent = d.readOnly || d.disabled;
        } else {
            doPrevent = true;
        }
    }

    if (doPrevent) {
        event.preventDefault();
    }
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

function formatDateTime(date) {
    var d;
    if (typeof date == "Date") {
        d = date;
    } else if (isNaN(date)) {
        d = new Date(Date.parse(date));
    } else {
        d = new Date(date);
    }
    return (d.getMonth() + 1) + '/' + (d.getDate()) + '/' + (d.getFullYear()) + ' ' + d.getHours() + ':' + d.getMinutes();
}

app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            redirectTo: '/snapshot',
        })
        .when('/snapshot', {
            controller: 'SnapshotController',
            templateUrl: 'snapshot.htm'
        })
        .otherwise({
            redirectTo: '/snapshot'
        });
});

app.controller('BookingController', ['$scope', function($scope) {
    var BookingForm = this;

    var CurrentBooking = $scope.BookingForm.CurrentBooking;

    BookingForm.toggleSpot = function() {
        $scope.BookingForm.CurrentBooking.chooseSpot = $scope.BookingForm.CurrentBooking.chooseSpot ? false : true;
    };

    $scope.createBookingFrom = function() {
        $scope.BookingForm.CurrentBooking = $scope.BookingForm.CurrentBooking.createNewBooking();
    };

    $scope.updateCheckOut = function() {
        //at Number Nights & Check In Date
        var booking = $scope.BookingForm.CurrentBooking;
        var a = new Date(Date.parse(booking.checkInDate) + (booking.numberNights * timestampDay));
        booking.checkOutDate = a.getMonth() + 1 + "/" + (a.getDate()) + "/" + a.getFullYear();
        booking.calculateDollarAmounts();
    };

    $scope.updateNumberNights = function() {
        //at Check out Date
        var booking = $scope.BookingForm.CurrentBooking;
        var a = (Date.parse(booking.checkOutDate) - Date.parse(booking.checkInDate)) / (timestampDay);
        booking.numberNights = a;
        booking.calculateDollarAmounts();
    }

    $scope.AddPayment = function() {
        var amount = $('#payment_amount').val() != "" ? parseInt($('#payment_amount').val()) : 0;
        var type = "";
        if ($('#cash:checked').length > 0) {
            type = "cash";
        } else if ($('#eftpos:checked').length > 0) {
            type = "eftpos";
        } else {
            //Throw error or do nothing and do not process payment
            return;
        }

        if ($scope.BookingForm.CurrentBooking.addPayment(amount, type)) {
            //Clear payment fields
            $('#cash,#eftpos').prop('checked', false);
            $('#payment_amount').val("");
        }
    };

}]);

app.controller('SnapshotController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {

    var Booking = function(booking) {

        this.paymentsTotal = function() {
            var total = 0;
            this.payments.forEach(function(payment) {
                total += (!isNaN(payment.amount) ? parseInt(payment.amount) : 0);
            }, 0);

            // for(var i=0;i<this.payments.length;i++) {
            // 	if(!isNaN(this.payments[i].amount))
            // 		total += parseFloat(this.payments[i].amount);
            // }
            return total;
        };

        this.calculateDollarAmounts = function() {
            var DefaultDailyRate = $scope.DefaultDailyRate,
                total, DailyRate, WeeklyRate;

            var numWeeks = Math.floor(this.numberNights / 7);
            var nightsDaily = this.numberNights % 7;

            if (this.numberPeople == 1) {
                if (this.spotType == "Powered") {
                    DailyRate = 25;
                    WeeklyRate = 150;
                } else {
                    DailyRate = 22;
                    WeeklyRate = 140;
                }
            } else {
                if (this.spotType == "Powered") {
                    DailyRate = (DefaultDailyRate * this.numberPeople) + 5;
                    WeeklyRate = 200;
                } else {
                    DailyRate = DefaultDailyRate * this.numberPeople;
                    WeeklyRate = this.numberPeople * 90;
                }
            }

            if (this.keepWeekly) {
                total = (DailyRate * this.numberNights);
            } else {
                total = (numWeeks * WeeklyRate) + (DailyRate * nightsDaily);
            }

            this.amountPerNight = DailyRate;
            this.amountTotal = total;
            this.amountPaid = this.paymentsTotal();
            var currentDay = Date.parse(formatDate(new Date())) >= Date.parse(this.checkOutDate) ? formatDate(Date.parse(this.checkOutDate) - timestampDay) : formatDate(new Date());
            var currentDayNum = ((Date.parse(currentDay) - Date.parse(this.checkInDate)) / timestampDay) + 1;
            var amountOwed = DailyRate * currentDayNum - parseInt(this.paymentsTotal());
            if (amountOwed < 0) {
                this.amountOwed = 0;
            } else {
                this.amountOwed = amountOwed;
            }

            if (this.amountPaid == this.amountTotal)
                this.isPaid = true;
            else
                this.isPaid = false;

        };

        this.toggleWeeklyStay = function() {
            if (this.isWeekly) {
                this.numberNights = 1;
                this.isWeekly = false;
            } else {
                this.numberNights = 7;
                this.isWeekly = true;
            }
            this.calculateDollarAmounts()
        };

        this.isEqual = function(booking) {
            if (this.bookingId !== booking.bookingId) {
                return false;
            }
            if (this.spotType !== booking.spotType) {
                return false;
            }
            if (this.name !== booking.name) {
                return false;
            }
            if (this.type !== booking.type) {
                return false;
            }
            if (this.registration !== booking.registration) {
                return false;
            }
            if (this.country !== booking.country) {
                return false;
            }
            if (this.numberNights !== booking.numberNights) {
                return false;
            }
            if (this.numberPeople !== booking.numberPeople) {
                return false;
            }
            if (this.email !== booking.email) {
                return false;
            }
            if (this.phoneNumber !== booking.phoneNumber) {
                return false;
            }
            if (this.amountTotal !== booking.amountTotal) {
                return false;
            }
            if (this.amountPerNight !== booking.amountPerNight) {
                return false;
            }
            if (this.amountPaid !== booking.amountPaid) {
                return false;
            }
            if (this.amountOwed !== booking.amountOwed) {
                return false;
            }
            if (this.checkInDate !== booking.checkInDate) {
                return false;
            }
            if (this.checkOutDate !== booking.checkOutDate) {
                return false;
            }
            if (this.payLater !== booking.payLater) {
                return false;
            }
            if (this.notes !== booking.notes) {
                return false;
            }
            return true;
        }

        this.copy = function(booking) {
            this.bookingId = booking.bookingId;
            this.bookingType = booking.bookingType;
            this.spotType = booking.spotType;
            this.name = booking.name;
            this.type = booking.type;
            this.registration = booking.registration;
            this.country = booking.country;
            this.numberNights = booking.numberNights;
            this.numberPeople = booking.numberPeople;
            this.email = booking.email;
            this.phoneNumber = booking.phoneNumber;
            this.amountTotal = booking.amountTotal;
            this.amountPerNight = booking.amountPerNight;
            this.amountPaid = booking.amountPaid;
            this.amountOwed = booking.amountOwed;
            this.checkInDate = booking.checkInDate;
            this.checkOutDate = booking.checkOutDate;
            this.payLater = booking.payLater;
            this.payments = booking.payments;
            this.notes = booking.notes;
            this.spots = booking.spots;
            this.spotNumber = this.getCurrentSpot();
            this.isWeekly = booking.isWeekly;

            this.calculateDollarAmounts();
        };

        this.isNewBooking = function() {
            if (this.bookingType == 'New Reservation' || this.bookingType == 'New Booking')
                return true;
            else
                return false;
        };

        this.addPayment = function(amount, type) {
            var payment = new Payment();
            var maxSeq = 0;
            if (isNaN(amount)) {
                //Throw error:
                alert("Amount provided is not a number");
                return false;
            }

            payment.amount = parseInt(amount);
            payment.type = type;

            if (parseInt(this.amountPaid) + payment.amount > this.amountTotal) {
                //Throw error: Cannot take another payment if already paid up
                alert("Error: Payment would exceed total amount due!");
                return false;
            } else if (parseInt(this.amountPaid) + payment.amount < 0) {
                alert("Error: cannot refund more money than was paid");
                return false;
            }

            if (payment.amount < 0) {
                payment.type = "Refund";
            }

            //Add payment to the Booking object and recalculate teh dollar amounts (mainly just the amount owed)
            this.payments.forEach(function(element) {
                if (parseInt(element.sequence) > parseInt(maxSeq)) {
                    maxSeq = parseInt(element.sequence);
                }
            });
            payment.sequence = parseInt(maxSeq) + 1;
            this.payments = this.payments.concat(payment);
            this.calculateDollarAmounts();
            return true;
        };

        this.deletePayment = function(seq) {
            if (window.confirm("Are you sure you want to delete this payment?")) {
                var test = this.payments.filter(function(e) {
                    return e.sequence != seq;
                });
                this.payments = test;
            }
            this.calculateDollarAmounts();
        };

        this.getCurrentSpot = function() {
            //TODO: Add more checking?
            if (this.spots == undefined || this.spots == null) {
                return null;
            }
            if (this.spots.length == 0)
                return null;

            var todaysSpot = this.spots.filter(function(spot) {
                return Date.parse(spot.occupiedDate) == (Snapshot.ViewDate == "Today" ? (Date.parse(formatDate(new Date()))) : (Date.parse(Snapshot.ViewDate)));
            });
            if (todaysSpot.length == 0) {
                return null;
            } else {
                return parseInt(todaysSpot[0].number);
            }
        };

        this.createNewBooking = function() {
            var newBooking = new Booking(this);
            newBooking.bookingId = "";
            newBooking.bookingType = "New Booking";
            newBooking.payments = [];
            newBooking.isPaid = false;
            newBooking.checkInDate = formatDate(new Date());
            newBooking.checkOutDate = formatDate((new Date()).getTime() + (timestampDay * newBooking.numberNights));
            newBooking.preferredSpot = newBooking.spots.length > 0 ? newBooking.spots[newBooking.spots.length - 1] : 0;
            newBooking.spots = [];
            return newBooking;
        };

        this.saveBooking = function() {
            if (this.validateBooking()) {
                //Update bookingType status before saving to the server. Should be done on the server???
                $scope.getSpotAvailability();
            } else {
                //Display Error
            }
        };

        this.regoChange = function() {
            this.registration = this.registration.toUpperCase();
        };

        this.validateBooking = function() {
            //booking validation logic
            return true;
        }

        this.checkIn = function() {
            this.bookingType = "New Booking";
            BookingForm.header = "New Booking";
            BookingForm.saveButtonText = "Save New Booking";
        };

        this.bookingId = "";
        this.bookingType = "New Booking";
        this.spotType = "Unpowered";
        this.name = "";
        this.type = "";
        this.registration = "";
        this.country = "";
        this.numberNights = 1;
        this.numberPeople = 2;
        this.email = "";
        this.phoneNumber = "";
        this.amountTotal = 30;
        this.amountPerNight = 30;
        this.amountPaid = 0;
        this.amountOwed = 30;
        this.checkInDate = Snapshot.getDailyDate();
        this.checkOutDate = formatDate(new Date(Date.parse(Snapshot.getDailyDate()) + (timestampDay)));
        this.payLater = false;
        this.isPaid = false;
        this.payments = [];
        this.spots = [];
        this.notes = "";
        this.isCancelled = false;
        this.preferredSpot = 0;
        this.chooseSpot = false;
        this.isWeekly = false;

        if (booking != null && typeof booking !== undefined)
            this.copy(booking);

        this.calculateDollarAmounts();
    };

    $scope.BookingObject = Booking;

    var Snapshot = this;

    var BookingForm = $scope.BookingForm = {};
    BookingForm.CurrentBooking = {};

    this.Bookings = [];

    $scope.showBookingForm = false;

    Snapshot.ViewDate = "Today";
    Snapshot.WeeklyDate = "Today";
    Snapshot.WeeklyAvailability = [];
    Snapshot.showSearch = false;
    Snapshot.searchText = "";
    Snapshot.InHouseSort = {
        sortText: "spotNumber",
        value: "spotNumber",
        reverse: false,
        searchText: ""
    };
    Snapshot.searchResults = [];
    Snapshot.SuccessMessage = "";
    Snapshot.ErrorMessage = "";
    Snapshot.ShowError = false;
    Snapshot.ShowSuccess = false;

    $scope.toggleSearch = function() {
        Snapshot.showSearch = Snapshot.showSearch == true ? false : true;
    };

    Snapshot.chgInHouseSort = function(prop) {
        if (Snapshot.InHouseSort.value == prop) {
            Snapshot.InHouseSort.reverse = Snapshot.InHouseSort.reverse ? false : true;
        } else {
            Snapshot.InHouseSort.reverse = false;
        }
        Snapshot.InHouseSort.value = prop;
    };

    Snapshot.getDailyDate = function() {
        var todaysDate;
        if (Snapshot.ViewDate == "Today") {
            todaysDate = formatDate(new Date());
        } else {
            todaysDate = Snapshot.ViewDate;
        }
        return todaysDate;
    };

    //Takes a parameter in the form of either date string
    Snapshot.setDailyDate = function(date) {
        if (isNaN(date)) {
            if (Date.parse(date) == Date.parse(formatDate(new Date())))
                Snapshot.ViewDate = "Today";
            else
                Snapshot.ViewDate = formatDate(date);
        } else if (date == "Today") {
            Snapshot.ViewDate = "Today";
        } else {
            if (date == Date.parse(formatDate(new Date())))
                Snapshot.ViewDate = "Today";
            else
                Snapshot.ViewDate = formatDate(date);
        }

    };

    Snapshot.clearSearch = function() {
        console.log("In clearSearch!");
        Snapshot.searchText = "";
        Snapshot.searchResults = [];
    };

    Snapshot.getWeeklyDate = function() {
        var todaysDate;
        if (Snapshot.WeeklyDate == "Today") {
            todaysDate = formatDate(new Date());
        } else {
            todaysDate = Snapshot.WeeklyDate;
        }
        return todaysDate;
    };

    //Takes a parameter in the form of either date string
    Snapshot.setWeeklyDate = function(date) {
        if (isNaN(date)) {
            if (Date.parse(date) == Date.parse(formatDate(new Date())))
                Snapshot.WeeklyDate = "Today";
            else
                Snapshot.WeeklyDate = formatDate(date);
        } else if (date == "Today") {
            Snapshot.WeeklyDate = "Today";
        } else {
            if (date == Date.parse(formatDate(new Date())))
                Snapshot.WeeklyDate = "Today";
            else
                Snapshot.WeeklyDate = formatDate(date);
        }

    };

    $scope.searchBookings = function() {
        Snapshot.searchResults = [];
        if (Snapshot.searchText != "") {
            $http.get('/qbox/service/webservice.php/search?q=' + Snapshot.searchText)
                .success(function(data, status, headers, config) {
                    if (data.bookings.length > 0) {
                        data.bookings.forEach(function(element) {
                            Snapshot.searchResults = Snapshot.searchResults.concat(new Booking(element));
                        });
                    } else {
                        //No Data returned;
                    }
                })
                .error(function(data, status, headers, config) {
                    //Throw Error message
                });
        }
    };

    $scope.getConfig = function() {
        $http.get('/qbox/service/webservice.php/config').success(function(data, status, headers, config) {
            Snapshot.spotConfig = data.spotConfig;
            Snapshot.spotTypes = data.spotTypes;
            $scope.numberParkableSpots = Snapshot.spotConfig.filter(function(spot) {
                return spot.type.search("unpowered") != -1;
            }).length;
            $scope.numberTentTotal = Snapshot.spotConfig.filter(function(spot) {
                return spot.type.search("tent") != -1;
            }).length;
            $scope.getDailyBookings();
        }).error(function(data, status, headers, config) {

        });
    };

    $scope.toggleBookingForm = function() {
        if ($scope.showBookingForm) {
            if (!BookingForm.CurrentBooking.isEqual(BookingForm.UnchangedBooking)) {
                var confirm = window.confirm('This booking has been changed. Do you want to continue without saving changes?')
                if (confirm)
                    $scope.showBookingForm = false;
            } else {
                $scope.showBookingForm = false;
            }
        } else {
            BookingForm.UnchangedBooking = new Booking(BookingForm.CurrentBooking);
            $scope.showBookingForm = true;
        }
    }

    Snapshot.createBooking = function() {
        var booking = new Booking();
        BookingForm.header = "New Booking";
        BookingForm.saveButtonText = "Save new Booking";
        booking.bookingType = "New Booking";
        BookingForm.CurrentBooking = booking;
        $scope.toggleBookingForm();
        setTimeout(function() {
            $('#booking_name').focus();
        }, 1);
    };

    Snapshot.createReservation = function() {
        var booking = new Booking();
        booking.bookingType = "New Reservation";
        BookingForm.header = "New Reservation";
        BookingForm.saveButtonText = "Save new Reservation";
        BookingForm.CurrentBooking = booking;
        $scope.toggleBookingForm();
        //Weird hack to get this to work in Chrome (bug?)
        setTimeout(function() {
            $('#booking_name').focus();
        }, 1);
    };

    Snapshot.loadBooking = function($id, $isSearch) {
        var booking = Snapshot.getBookingById($id, $isSearch);
        if (booking === false) {
            //Throw proper error!
            Snapshot.displayError("Error: there is no booking with that ID");
        }
        BookingForm.header = booking.bookingType + " # " + booking.bookingId;
        BookingForm.saveButtonText = "Update " + booking.bookingType;

        $scope.BookingForm.CurrentBooking = new Booking(booking);
        $scope.toggleBookingForm();
    };

    Snapshot.displayError = function(msg) {
        Snapshot.ErrorMessage = msg;
        Snapshot.ShowError = true;
        $timeout(function() {
            Snapshot.ShowError = false;
        }, 5000);
    };

    Snapshot.displaySuccess = function(msg) {
        Snapshot.SuccessMessage = msg;
        Snapshot.ShowSuccess = true;
        $timeout(function() {
            Snapshot.ShowSuccess = false;
        }, 5000);
    }

    this.getDailyRate = function() {
        //TODO: Get current Day's daily rate from server. default to 15 if empty value/no value
        //Part of config get?
        return 15;
    };

    $scope.determineSpots = function(spots) {
        if (BookingForm.CurrentBooking.bookingType == "Reservation" || BookingForm.CurrentBooking.bookingType == "New Reservation")
            return [];

        var AvailableSpot = function(number, occupiedDate, occupied) {
            this.number = number;
            this.occupiedDate = occupiedDate;
            this.occupied = occupied;
        };
        var startDateTS = Date.parse(BookingForm.CurrentBooking.checkInDate);
        var endDateTS = Date.parse(BookingForm.CurrentBooking.checkOutDate);
        var bookingRange = [];
        //bookingRange is an array holding all the objects for potential spot allocations. To be filtered later.

        for (var i = startDateTS; i < endDateTS; i += timestampDay) {
            bookingRange = bookingRange.concat({
                day: i,
                spots: []
            });
        }

        var DatesAlreadyBooked = BookingForm.CurrentBooking.spots.filter(function(element) {
            return Date.parse(element.occupiedDate) >= Date.parse(BookingForm.CurrentBooking.checkInDate) && Date.parse(element.occupiedDate) < Date.parse(BookingForm.CurrentBooking.checkOutDate);
        });
        //DatesNotYetBooked represents all the days not yet accounted for in the spot allocation
        //Based on same structure as bookingRange
        var DatesNotYetBooked = bookingRange.filter(function(element) {
            return !BookingForm.CurrentBooking.spots.some(function(e) {
                return Date.parse(e.occupiedDate) == element.day;
            });
        });

        if (DatesNotYetBooked.length == 0) {
            //if no new spots need to be allocated, then return the current spot array.
            return BookingForm.CurrentBooking.spots;
        }

        //variable to hold all the elements in spotConfig that have a type property that contains the booking object's spot type
        var totalSpots = Snapshot.spotConfig.filter(function(spot) {
            return spot.type.search(BookingForm.CurrentBooking.spotType.toLowerCase()) != -1;
        });

        DatesNotYetBooked.forEach(function(day) {
            day.spots = totalSpots.filter(function(spot) {
                return !spots.some(function(sp) {
                    return Date.parse(sp.occupiedDate) == day.day && sp.number == spot.spotId;
                });
            });
        });
        if (DatesNotYetBooked[0].spots.length == 0) {
            //There's no availability, throw error
        }


        //set preferredSpot either to the spot specified in the interface, to the last value in the DatesAlreadyBooked array (so that the person doesn't have to move)
        //or to null, meaning that the customer is starting a new booking process.
        var preferredSpot = BookingForm.CurrentBooking.preferredSpot == 0 ? (DatesAlreadyBooked.length > 0 ? DatesAlreadyBooked[DatesAlreadyBooked.length - 1].number : null) : BookingForm.CurrentBooking.preferredSpot;

        var filledArr = fillSpots(DatesNotYetBooked, preferredSpot);
        if (filledArr === false) {
            return false;
        } else {
            return DatesAlreadyBooked.concat(filledArr);
        }
    };
    //Cycle through each spot in the first day. If any number matches the full length of the range, return an array of
    function matchRange(availableSpots) {
        var matchedArr = [];
        var range = availableSpots.length;
        var Spot = function(number, occupiedDate) {
            this.number = number;
            this.occupiedDate = occupiedDate;
            this.status = "new";
            this.type = BookingForm.CurrentBooking.spotType;
        };

        var startDateTS = availableSpots[0].day;
        var matched = false;
        availableSpots[0].spots.forEach(function(availableSpot) {
            if (!matched) {
                matched = availableSpots
                    .every(function(day) {
                        return day.spots.some(function(spot) {
                            return availableSpot.number == spot.number;
                        });
                    });
                if (matched) {
                    for (var j = 0; j < range; j++) {
                        matchedArr[j] = new Spot(availableSpot.spotId, formatDate(startDateTS + (j * timestampDay)));
                    }
                    return matchedArr;
                }
            }
        });
        if (matched) {
            return matchedArr;
        } else {
            return false;
        }
    }

    function fillSpots(spots, preferredSpot) {

        //TODO: change this to check a config array dynamically to determine spot type totals

        var daySpan = spots.length;


        //TODO: put IF statement to check if same booking ID (IE changing check-out dates)

        var currentSpot = 1,
            spans = false,
            b_spots = [];
        var matchedArr = [];

        //See if preferredSpot can be filled before using first available
        if (preferredSpot != null) {
            matchedArr = matchRange(spots, daySpan, preferredSpot);
            if (matchedArr !== false) {
                daySpan -= matchedArr.length;
                b_spots = matchedArr;
            }
        }

        // set daySpan and startDateTS if match found
        daysLeftToProcess = daySpan;
        while (daysLeftToProcess > 0) {
            for (var rangeIndex = daySpan; rangeIndex > 0; rangeIndex--) {

                matchedArr = matchRange(spots.slice(daySpan - daysLeftToProcess, rangeIndex));


                if (matchedArr !== false) {
                    daysLeftToProcess -= matchedArr.length;
                    b_spots = b_spots.concat(matchedArr);

                    break;
                }
            }
            daysLeftToProcess = 0;
        }

        if (b_spots.length == daySpan) {
            return b_spots;
        } else {
            return false;
        }
    };

    $scope.getSpotAvailability = function() {
        var startDate = formatDate(Date.parse(BookingForm.CurrentBooking.checkInDate) + (BookingForm.CurrentBooking.spots.length * timestampDay));
        $http.get('/qbox/service/webservice.php/availability?startDate=' + startDate + '&endDate=' + BookingForm.CurrentBooking.checkOutDate)
            .success(function(data, status, headers, config) {
                if ((r = $scope.determineSpots(data.spotCounts)) !== false) {
                    BookingForm.CurrentBooking.spots = r;
                    $http.post('/qbox/service/webservice.php/booking', BookingForm.CurrentBooking)
                        .success(function(data, status, headers, config) {
                            if (data.result === "successful") {
                                $scope.showBookingForm = false;
                                Snapshot.saveBooking(BookingForm.CurrentBooking);
                                $scope.getDailyBookings();
                                $scope.getWeeklyBookings();
                                var msg = "Booking for " + data.bookingId + " has been saved!";
                                if (BookingForm.CurrentBooking.bookingType == "New Booking")
                                    msg += " They are in spot " + BookingForm.CurrentBooking.spots[0].number;
                                Snapshot.displaySuccess(msg);
                            } else {
                                //Display Error
                            }
                        })
                        .error(function(data, status, headers, config) {
                            //Display Error Message!
                        });
                } else {
                    Snapshot.displayError("some days are not available!");
                }
            })
            .error(function(data, status, headers, config) {

            });
    };

    Snapshot.nextDay = function() {
        var selectedDate = Snapshot.ViewDate == "Today" ? formatDate(new Date()) : Snapshot.ViewDate;
        var currTS = Date.parse(selectedDate);
        var nextTS = currTS + timestampDay;
        Snapshot.setDailyDate(nextTS);
        $scope.getDailyBookings();
    };

    Snapshot.nextWDay = function() {
        var selectedDate = Snapshot.WeeklyDate == "Today" ? formatDate(new Date()) : Snapshot.WeeklyDate;
        var currTS = Date.parse(selectedDate);
        var nextTS = currTS + timestampDay;
        Snapshot.setWeeklyDate(nextTS);
        $scope.getWeeklyBookings();
    };

    Snapshot.previousDay = function() {
        var selectedDate = Snapshot.ViewDate == "Today" ? formatDate(new Date()) : Snapshot.ViewDate;
        var currTS = Date.parse(selectedDate);
        var nextTS = currTS - timestampDay;
        Snapshot.setDailyDate(nextTS);
        $scope.getDailyBookings();
    };

    Snapshot.previousWDay = function() {
        var selectedDate = Snapshot.WeeklyDate == "Today" ? formatDate(new Date()) : Snapshot.WeeklyDate;
        var currTS = Date.parse(selectedDate);
        var nextTS = currTS - timestampDay;
        Snapshot.setWeeklyDate(nextTS);
        $scope.getWeeklyBookings();
    };

    $scope.getDailyBookings = function() {
        var now, today;

        now = Snapshot.getDailyDate();

        Snapshot.setDailyDate(now);

        today = formatDate(now);

        $http.get('/qbox/service/webservice.php/booking?startDate=' + today + '&endDate=' + today)
            .success(function(data, status, headers, config) {
                if (typeof data !== undefined || data !== null) {
                    if (typeof data.result == undefined) {
                        if (data.result == "error") {
                            //Print error message
                        }
                    } else {
                        $scope.Bookings = data.bookings.map(function(b) {
                            return new Booking(b);
                        });

                        var reservations = $scope.Bookings.filter(function(element) {
                            return element.bookingType == "Reservation";
                        });

                        if (reservations.length == 0)
                            Snapshot.areReservations = false;
                        else
                            Snapshot.areReservations = true;

                        var powered = 0,
                            unpowered = 0,
                            tent = 0,
                            total = 0;
                        //To change later when spots are based on an array stored in booking object.
                        for (var i = 0; i < $scope.Bookings.length; i++) {
                            switch ($scope.Bookings[i].spotType) {
                                case "Unpowered":
                                    unpowered++;
                                    break;
                                case "Powered":
                                    powered++;
                                    break;
                                case "Tent":
                                    tent++;
                                    break;
                            }
                        }

                        Snapshot.Tent = parseInt($scope.numberTentTotal) - parseInt(tent);
                        Snapshot.Total = (parseInt($scope.numberParkableSpots) - (parseInt(powered) + parseInt(unpowered)));
                        Snapshot.setWeeklyDate(today);
                        $scope.getWeeklyBookings();
                    }
                } else {
                    //Display error because no data was returned;
                }
            })
            .error(function(data, status, headers, config) {

            });
    };

    //parameter of string type
    $scope.getWeeklyBookings = function($date) {
        var now, today, week_raw, week, availability = [];

        now = Snapshot.getWeeklyDate();

        Snapshot.setWeeklyDate(now);

        today = formatDate(now);
        week_raw = new Date(Date.parse(today) + (timestampDay * 7));
        week = formatDate(week_raw);

        $http.get('/qbox/service/webservice.php/booking?startDate=' + today + '&endDate=' + week)
            .success(function(data, status, headers, config) {
                if (!(data.bookings == null || typeof data.bookings == undefined)) {
                    //Building an array to easily store values for weekly bookings
                    for (var i = 0; i < 7; i++) {
                        availability[i] = {
                            date: formatDate(Date.parse(today) + (timestampDay * i)),
                            parkable: 0,
                            tent: 0
                        };
                    }
                    //cycle through all bookings in the weekly data from the server
                    data.bookings.forEach(function(booking) {
                        //cycle through each day in the booking and match it to a section of the previously built array.
                        for (var dayIndex = Date.parse(today); dayIndex < Date.parse(week); dayIndex += timestampDay) {
                            var currentDay = availability.filter(function(day) {
                                return Date.parse(day.date) == dayIndex;
                            });
                            if (currentDay.length > 0) {
                                if (dayIndex >= Date.parse(booking.checkInDate) && dayIndex < Date.parse(booking.checkOutDate)) {
                                    if (booking.spotType == "Powered" || booking.spotType == "Unpowered") {
                                        currentDay[0].parkable++;
                                    } else if (booking.spotType == "Tent") {
                                        currentDay[0].tent++;
                                    }
                                }

                            } else {
                                //No data?
                            }
                        }
                    });

                    //TODO: Convert counted totals to spots left available!
                    var readableAvailability = availability.map(function(avail) {
                        var o = {};
                        o.date = avail.date;
                        o.parkable = $scope.numberParkableSpots - avail.parkable;
                        o.tent = $scope.numberTentTotal - avail.tent;
                        return o;
                    });
                    Snapshot.WeeklyAvailability = readableAvailability;

                } else {
                    //Throw error, no data
                }
            })
            .error(function(data, status, headers, config) {

            });
    };

    Snapshot.getBookingById = function($id, $isSearch) {
        var listing = $isSearch ? Snapshot.searchResults : $scope.Bookings;
        for (var i = 0; i < listing.length; i++) {
            if (listing[i].bookingId === $id) {
                var booking = listing[i];
                return booking;
            }
        }
        return false;
    };

    Snapshot.saveBooking = function(booking) {
        for (var i = 0; i < Snapshot.Bookings.length; i++) {
            if (Snapshot.Bookings[i].bookingId === booking.bookingId) {
                Snapshot.Bookings[i] = new Booking(booking);
            }
        }
    };

    $scope.loadBookingForm = function($id) {
        $scope.toggleBookingForm();
    };

    Snapshot.searchKeyDown = function($event) {
        if ($event.keyCode == 13)
            $scope.searchBookings();
    };

    $scope.DefaultDailyRate = this.getDailyRate();
}]);