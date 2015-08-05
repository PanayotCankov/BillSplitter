var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var observable = require("data/observable");
var observableArray = require("data/observable-array");
var Bill = (function (_super) {
    __extends(Bill, _super);
    function Bill() {
        _super.call(this);
        this._total = 0;
        this.products = new observableArray.ObservableArray();
    }
    Object.defineProperty(Bill.prototype, "total", {
        get: function () {
            return this._total;
        },
        enumerable: true,
        configurable: true
    });
    Bill.prototype.addFromImage = function (image) {
        var product = new Product(this, image);
        this.products.push(product);
        this.updateTotal();
    };
    Bill.prototype.removeProduct = function (product) {
        var index = this.products.indexOf(product);
        if (index > -1) {
            console.log("Remove index " + index);
            this.products.splice(index, 1);
        }
        this.updateTotal();
    };
    Bill.prototype.updateTotal = function () {
        var total = 0;
        for (var i = 0; i < this.products.length; i++) {
            total += this.products.getItem(i).price;
        }
        this._total = Math.ceil(total * 100) / 100;
        this.notifyPropertyChanged("total", this._total);
    };
    Bill.prototype.notifyPropertyChanged = function (propertyName, value) {
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: propertyName, value: value });
    };
    return Bill;
})(observable.Observable);
exports.Bill = Bill;
var Product = (function (_super) {
    __extends(Product, _super);
    function Product(bill, image) {
        _super.call(this);
        this.bill = bill;
        this.image = image;
        this.price = 2.99;
    }
    Product.prototype.remove = function () {
        this.bill.removeProduct(this);
    };
    return Product;
})(observable.Observable);
exports.Product = Product;
