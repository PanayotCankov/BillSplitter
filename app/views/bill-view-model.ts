import imageSource = require("image-source");

import observable = require("data/observable");
import observableArray = require("data/observable-array");

export class Bill extends observable.Observable {

    products: observableArray.ObservableArray<Product>;

    private _total: number;

    get total(): number {
        return this._total;
    }

    constructor() {
        super();
        this._total = 0;
        this.products = new observableArray.ObservableArray<Product>();
    }

    addFromImage(image: imageSource.ImageSource) {
        var product = new Product(this, image);
        this.products.push(product);
        this.updateTotal();
    }

    removeProduct(product: Product) {
        var index = this.products.indexOf(product);
        if (index > -1) {
            this.products.splice(index, 1);
            this.updateTotal();
        }
    }

    updateTotal() {
        var total = 0;
        for (var i = 0; i < this.products.length; i++) {
            total += this.products.getItem(i).price;
        }
        this._total = Math.ceil(total * 100) / 100;
        this.notifyPropertyChanged("total", this._total);
    }

    notifyPropertyChanged(propertyName: string, value: any) {
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: propertyName, value: value });
    }
}

export class Product extends observable.Observable {
    image: any;
    price: number;

    constructor(private bill: Bill, image: imageSource.ImageSource) {
        super();

        this.image = image;
        // Apply image parsing...
        this.price = 2.99;
    }

    remove() {
        this.bill.removeProduct(this);
    }
}
