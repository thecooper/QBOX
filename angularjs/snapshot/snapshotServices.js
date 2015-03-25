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