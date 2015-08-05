var gestures = require("ui/gestures");
var cameraModule = require("camera");
var absolute = require("ui/layouts/absolute-layout");
var imageSource = require("image-source");
var utils = require("utils/utils");
var billvm = require("./bill-view-model");
var page;
var billImageView;
var selectionContainer;
var selection;
var selectionStart;
var density;
var imageScale = 1;
var bill = new billvm.Bill();
function pageLoaded(args) {
    page = args.object;
    density = utils.layout.getDisplayDensity();
    billImageView = page.getViewById("billImageView");
    selectionContainer = page.getViewById("selection-container");
    selection = page.getViewById("selection");
    selectionStart = page.getViewById("selection-start");
    if (selectionContainer.android) {
        selectionContainer.android.setOnTouchListener(new android.view.View.OnTouchListener({
            onTouch: containerTouch
        }));
    }
    else if (selectionContainer.ios) {
        selectionContainer.observe(gestures.GestureTypes.pan, containerPan);
    }
    page.bindingContext = bill;
}
exports.pageLoaded = pageLoaded;
function addImageButtonTap() {
    cameraModule.takePicture().then(function (picture) {
        console.log("Result is an image source instance");
        if (picture.ios) {
            var image = picture.ios;
            if (image.imageOrientation != UIImageOrientation.UIImageOrientationUp) {
                UIGraphicsBeginImageContextWithOptions(image.size, false, image.scale);
                image.drawInRect(CGRectMake(0, 0, image.size.width, image.size.height));
                var normalizedImage = UIGraphicsGetImageFromCurrentImageContext();
                UIGraphicsEndImageContext();
                picture = imageSource.fromNativeSource(normalizedImage);
            }
        }
        billImageView.imageSource = picture;
        computeScale();
    });
}
exports.addImageButtonTap = addImageButtonTap;
function remove(e) {
    bill.removeProduct(e.object.bindingContext);
}
exports.remove = remove;
function computeScale() {
    var actualWidth = selectionContainer.getMeasuredWidth();
    var actualHeight = selectionContainer.getMeasuredHeight();
    var imageWidth = billImageView.imageSource.width;
    var imageheight = billImageView.imageSource.height;
    console.log("actual " + actualWidth + ", " + actualHeight + " image " + imageWidth + ", " + imageheight);
    imageScale = Math.min(actualWidth / imageWidth, actualHeight / imageheight);
    console.log("imageScale " + imageScale);
}
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
var topOffset = 40;
var selX;
var selY;
var selW;
var selH;
function panStarted(x, y) {
    selX = x;
    selY = y;
    selW = 0;
    selH = 0;
    selectionStart.visibility = "visible";
    absolute.AbsoluteLayout.setLeft(selectionStart, selX - 1);
    absolute.AbsoluteLayout.setTop(selectionStart, selY - topOffset - 1);
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
    selectionStart.visibility = "collapse";
    cropImage();
}
function updateSelection() {
    var left = selX - (selW > 0 ? 0 : -selW);
    var top = selY - (selH > 0 ? 0 : -selH);
    top -= topOffset;
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
    var left = (selX - (selW > 0 ? 0 : -selW));
    var top = (selY - (selH > 0 ? 0 : -selH)) - topOffset;
    var width = (Math.abs(selW));
    var height = (Math.abs(selH));
    left *= density / imageScale;
    top *= density / imageScale;
    width *= density / imageScale;
    height *= density / imageScale;
    left = Math.max(0, left);
    top = Math.max(0, top);
    width = Math.max(0, Math.min(imgSrc.width - left, width));
    height = Math.max(0, Math.min(imgSrc.height - top, height));
    if (width < 5 || height < 5) {
        return;
    }
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
