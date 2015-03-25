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