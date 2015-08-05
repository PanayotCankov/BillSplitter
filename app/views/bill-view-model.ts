import imageSource = require("image-source");

import observable = require("data/observable");
import observableArray = require("data/observable-array");

declare var G8Tesseract: any;
declare var G8OCREngineMode: any;
declare var G8PageSegmentationMode: any;

export class ObservableBase extends observable.Observable {
    protected notifyPropertyChanged(propertyName: string, value: any) {
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: propertyName, value: value });
    }
}

export class Bill extends ObservableBase {

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
            var product = this.products.getItem(i);
            if (!product.isNaN) {
                total += this.products.getItem(i).price;
            }
        }
        this._total = Math.round(total * 100) / 100;
        this.notifyPropertyChanged("total", this._total);
    }


}

export class Product extends ObservableBase {

    private _image: any;
    private _text: string;
    private _price: number;

    constructor(private bill: Bill, image: imageSource.ImageSource) {
        super();

        this._image = image;

        if (image.android) {
            // Parse in android
            this.price = 0;
        } else if (image.ios) {
            // Parse in iOS
            var tesseract = G8Tesseract.alloc().initWithLanguageEngineMode("eng+fra+bul", G8OCREngineMode.G8OCREngineModeTesseractOnly);
            tesseract.pageSegmentationMode = G8PageSegmentationMode.G8PageSegmentationModeAuto;
            tesseract.maximumRecognitionTime = 60.0;
            tesseract.image = (<any>image).ios.g8_blackAndWhite(); // picture.ios.g8_blackAndWhite();
            tesseract.recognize();

            console.log("Recognized: " + tesseract.recognizedText);

            this.text = tesseract.recognizedText.trim();

        } else {
            this.price = 0;
        }
    }

    get image() { return this._image; }

    get text(): string { return this._text; }
    set text(value: string) {
        this._text = value;
        this.notifyPropertyChanged("text", value);
        this.price = parseFloat(this._text);
    }

    get price(): any { return this._price }
    set price(value: any) {
        if (typeof value === "string") {
            value = <any>parseFloat(value);
        }
        this._price = value;
        this.notifyPropertyChanged("price", value);
        this.notifyPropertyChanged("isNaN", isNaN(this.price));
        this.bill.updateTotal();
    }

    get isNaN() { return isNaN(this.price); }

    remove() {
        this.bill.removeProduct(this);
    }
}
