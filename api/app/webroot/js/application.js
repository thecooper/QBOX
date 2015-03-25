var app = angular.module("specio",["ngResource"]);

app.controller("ProductController",["$scope","$http","$resource",function($scope,$http,$resource) {
	var ProductController = this;
	var Products = $resource('http://localhost/Spec.io/api/product.json');

	ProductController.selectedId = null;

	var query = Products.get({},function(f) {
		ProductController.ProductList = f.products;
		console.log(ProductController);
	});

	$scope.editProduct = function(id) {
		ProductController.selectedId = id;
	};
}]);

app.controller("ProductEditController",["$scope","$http","$resource",function($scope,$http,$resource) {
	var ProductEditController = this;
	var Product = $resource("http://localhost/Spec.io/api/product/:id.json");
}]);

/**
 * An object structure used to define products.
 */
var Product = function() {
	this.id = 0;
	this.companyId = 0;
	this.description = "";
	this.metrics = [];
	this.template = null;
	this.clientId = null;

	this.addMetric = function(n,t,v) {
		this.metrics = this.metrics.concat(new Metric(n,t,v));
	};

	this.saveProduct = function() {

	};
};

/**
 * an object structure used to define the various metrics of a given product. Is the 'a' of the
 * 'has a' relationship with Product.
 * @param string name  the name of the metric to be defined
 * @param string type  the type of metric it is. Floating number, integer, string, etc.
 * @param mixed value the value of the metric
 */
var MetricValue = function(id,product_id,template_id,value) {
	this.id = id;
	this.product_id = product_id;
	this.template_id = template_id;
	this.value = value;
};

var Template = function(id,product_id,name,description) {
	this.id = id;
	this.product_id = product_id;
	this.name = name;
	this.description = description;
};

var TemplateMetric = function(id,template_id,name,type) {
	this.id = id;
	this.template_id = template_id;
	this.name = name;
	this.type = type;
};

