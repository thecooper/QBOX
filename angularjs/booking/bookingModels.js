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