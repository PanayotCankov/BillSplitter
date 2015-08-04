import observable = require("data/observable");
import pages = require("ui/page");
import gestures = require("ui/gestures");
import cameraModule = require("camera");
import grid = require("ui/layouts/grid-layout");
import absolute = require("ui/layouts/absolute-layout");
import imageSource = require("image-source");
import image = require("ui/image");

var page;
var billImageView: image.Image;
var container: absolute.AbsoluteLayout;
var selection: grid.GridLayout;
var croppedImage: image.Image;
// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    // Get the event sender
    page = <pages.Page>args.object;
    // page.bindingContext = null;
    billImageView = <image.Image>page.getViewById("billImageView");
    container = <absolute.AbsoluteLayout>page.getViewById("image-container");
    selection = <grid.GridLayout> page.getViewById("selection");
    croppedImage = <image.Image> page.getViewById("cropped-image");
    container.observe(gestures.GestureTypes.pan, containerPan);
}


export function addImageButtonTap() {
    cameraModule.takePicture().then(picture => {
        console.log("Result is an image source instance");
        billImageView.imageSource = picture;
    });
}

// Selection
function containerPan(args: gestures.PanGestureEventData) {
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

var selX: number;
var selY: number;
var selW: number;
var selH: number;

function panStarted(x: number, y: number) {
    selX = x;
    selY = y;
    selW = 0;
    selH = 0;
    selection.borderWidth = 1;
    updateSelection();
}

function panMoving(x: number, y: number) {
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
    var top = selY - (selH > 0 ? 0 : -selH)

    console.log("selection[" + left + ", " + top + ", " + selW + ", " + selH + "]");

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

    var left = selX - (selW > 0 ? 0 : -selW);
    var top = selY - (selH > 0 ? 0 : -selH);
    var width = Math.abs(selW);
    var height = Math.abs(selH);
    var rect = CGRectMake(left, top, width, height); 
 
    // Create bitmap image from original image data,
    // using rectangle to specify desired crop area
    var imageRef = CGImageCreateWithImageInRect(billImageView.ios.image.CGImage, rect);
    var uiImage = UIImage.imageWithCGImage(imageRef);
    croppedImage.imageSource = imageSource.fromNativeSource(uiImage);
    CGImageRelease(imageRef);
}
