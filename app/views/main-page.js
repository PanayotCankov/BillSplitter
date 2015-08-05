var gestures = require("ui/gestures");
var cameraModule = require("camera");
var absolute = require("ui/layouts/absolute-layout");
var imageSource = require("image-source");
var utils = require("utils/utils");
var billvm = require("./bill-view-model");
var page;
var billImageView;
var container;
var selection;
var density;
var bill = new billvm.Bill();
function pageLoaded(args) {
    page = args.object;
    density = utils.layout.getDisplayDensity();
    billImageView = page.getViewById("billImageView");
    container = page.getViewById("image-container");
    selection = page.getViewById("selection");
    if (container.android) {
        container.android.setOnTouchListener(new android.view.View.OnTouchListener({
            onTouch: containerTouch
        }));
    }
    else if (container.ios) {
        container.observe(gestures.GestureTypes.pan, containerPan);
    }
    page.bindingContext = bill;
}
exports.pageLoaded = pageLoaded;
function addImageButtonTap() {
    cameraModule.takePicture().then(function (picture) {
        console.log("Result is an image source instance");
        billImageView.imageSource = picture;
    });
}
exports.addImageButtonTap = addImageButtonTap;
function remove(e) {
    bill.removeProduct(e.object.bindingContext);
}
exports.remove = remove;
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
    bill.addFromImage(croppedImageSource);
}
