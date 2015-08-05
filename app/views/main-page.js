var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var gestures = require("ui/gestures");
var cameraModule = require("camera");
var absolute = require("ui/layouts/absolute-layout");
var imageSource = require("image-source");
var utils = require("utils/utils");
var observable = require("data/observable");
var observableArray = require("data/observable-array");
var page;
var billImageView;
var container;
var selection;
var croppedImage;
var density;
var productsListView;
var Product = (function (_super) {
    __extends(Product, _super);
    function Product() {
        _super.apply(this, arguments);
    }
    return Product;
})(observable.Observable);
var productsList = new observableArray.ObservableArray();
function addProduct(image, price) {
    var product = new Product();
    product.image = image;
    product.price = 2.99;
    productsList.push(product);
}
function pageLoaded(args) {
    page = args.object;
    density = utils.layout.getDisplayDensity();
    billImageView = page.getViewById("billImageView");
    container = page.getViewById("image-container");
    selection = page.getViewById("selection");
    croppedImage = page.getViewById("cropped-image");
    if (container.android) {
        container.android.setOnTouchListener(new android.view.View.OnTouchListener({
            onTouch: containerTouch
        }));
    }
    else if (container.ios) {
        container.observe(gestures.GestureTypes.pan, containerPan);
    }
    productsListView = page.getViewById("products-list");
    productsListView.items = productsList;
}
exports.pageLoaded = pageLoaded;
function addImageButtonTap() {
    cameraModule.takePicture().then(function (picture) {
        console.log("Result is an image source instance");
        billImageView.imageSource = picture;
    });
}
exports.addImageButtonTap = addImageButtonTap;
function containerTouch(view, motionEvent) {
    var x = motionEvent.getX() / density;
    var y = motionEvent.getY() / density;
    switch (motionEvent.getAction()) {
        case android.view.MotionEvent.ACTION_DOWN:
            panStarted(x, y);
            break;
        case android.view.MotionEvent.ACTION_MOVE:
            panMoving(x - selX, y - selY);
            break;
        case android.view.MotionEvent.ACTION_UP:
            panEnded();
            break;
    }
    return true;
}
function containerPan(args) {
    if (args.ios) {
        switch (args.ios.state) {
            case UIGestureRecognizerState.UIGestureRecognizerStateBegan:
                var point = args.ios.locationInView(args.view.ios);
                panStarted(point.x, point.y);
                break;
            case UIGestureRecognizerState.UIGestureRecognizerStateChanged:
                panMoving(args.deltaX, args.deltaY);
                break;
            case UIGestureRecognizerState.UIGestureRecognizerStateEnded:
                panEnded();
                break;
        }
    }
}
var selX;
var selY;
var selW;
var selH;
function panStarted(x, y) {
    selX = x;
    selY = y;
    selW = 0;
    selH = 0;
    selection.borderWidth = 1;
    updateSelection();
}
function panMoving(x, y) {
    selW = x;
    selH = y;
    updateSelection();
}
function panEnded() {
    selection.borderWidth = 0;
    cropImage();
}
function updateSelection() {
    var left = selX - (selW > 0 ? 0 : -selW);
    var top = selY - (selH > 0 ? 0 : -selH);
    absolute.AbsoluteLayout.setTop(selection, top);
    absolute.AbsoluteLayout.setLeft(selection, left);
    selection.width = Math.abs(selW);
    selection.height = Math.abs(selH);
}
function cropImage() {
    var imgSrc = billImageView.imageSource;
    if (!imgSrc) {
        return;
    }
    var left = (selX - (selW > 0 ? 0 : -selW)) * density;
    var top = (selY - (selH > 0 ? 0 : -selH)) * density;
    var width = (Math.abs(selW)) * density;
    var height = (Math.abs(selH)) * density;
    var croppedImageSource;
    if (billImageView.ios) {
        var rect = CGRectMake(left, top, width, height);
        var imageRef = CGImageCreateWithImageInRect(billImageView.ios.image.CGImage, rect);
        var uiImage = UIImage.imageWithCGImage(imageRef);
        croppedImageSource = imageSource.fromNativeSource(uiImage);
        CGImageRelease(imageRef);
    }
    else if (imgSrc.android) {
        var croppedBitmap = android.graphics.Bitmap.createBitmap(imgSrc.android, left, top, width, height);
        croppedImageSource = imageSource.fromNativeSource(croppedBitmap);
    }
    addProduct(croppedImageSource, 2.99);
}
