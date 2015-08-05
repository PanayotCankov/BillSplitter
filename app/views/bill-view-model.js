var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var observable = require("data/observable");
var observableArray = require("data/observable-array");
var ObservableBase = (function (_super) {
    __extends(ObservableBase, _super);
    function ObservableBase() {
        _super.apply(this, arguments);
    }
    ObservableBase.prototype.notifyPropertyChanged = function (propertyName, value) {
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: propertyName, value: value });
    };
    return ObservableBase;
})(observable.Observable);
exports.ObservableBase = ObservableBase;
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
            this.products.splice(index, 1);
            this.updateTotal();
        }
    };
    Bill.prototype.updateTotal = function () {
        var total = 0;
        for (var i = 0; i < this.products.length; i++) {
            var product = this.products.getItem(i);
            if (!product.isNaN) {
                total += this.products.getItem(i).price;
            }
        }
        this._total = Math.round(total * 100) / 100;
        this.notifyPropertyChanged("total", this._total);
    };
    return Bill;
})(ObservableBase);
exports.Bill = Bill;
var Product = (function (_super) {
    __extends(Product, _super);
    function Product(bill, image) {
        _super.call(this);
        this.bill = bill;
        this._image = image;
        if (image.android) {
            this.price = 0;
        }
        else if (image.ios) {
            var tesseract = G8Tesseract.alloc().initWithLanguageEngineMode("eng+fra+bul", G8OCREngineMode.G8OCREngineModeTesseractOnly);
            tesseract.pageSegmentationMode = G8PageSegmentationMode.G8PageSegmentationModeAuto;
            tesseract.maximumRecognitionTime = 60.0;
            tesseract.image = image.ios.g8_blackAndWhite();
            tesseract.recognize();
            console.log("Recognized: " + tesseract.recognizedText);
            this.text = tesseract.recognizedText.trim();
        }
        else {
            this.price = 0;
        }
    }
    Object.defineProperty(Product.prototype, "image", {
        get: function () { return this._image; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "text", {
        get: function () { return this._text; },
        set: function (value) {
            this._text = value;
            this.notifyPropertyChanged("text", value);
            this.price = parseFloat(this._text);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "price", {
        get: function () { return this._price; },
        set: function (value) {
            if (typeof value === "string") {
                value = parseFloat(value);
            }
            this._price = value;
            this.notifyPropertyChanged("price", value);
            this.notifyPropertyChanged("isNaN", isNaN(this.price));
            this.bill.updateTotal();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "isNaN", {
        get: function () { return isNaN(this.price); },
        enumerable: true,
        configurable: true
    });
    Product.prototype.remove = function () {
        this.bill.removeProduct(this);
    };
    return Product;
})(ObservableBase);
exports.Product = Product;
