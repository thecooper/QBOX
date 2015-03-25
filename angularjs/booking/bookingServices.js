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