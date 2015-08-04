import observable = require("data/observable");
import pages = require("ui/page");
import gestures = require("ui/gestures");
import cameraModule = require("camera");
import imageSource = require("image-source");

var page;
var billImageView;

// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    // Get the event sender
    page = <pages.Page>args.object;
    // page.bindingContext = null;
    billImageView = page.getViewById("billImageView");
}

export function addImageButtonTap() {
    cameraModule.takePicture().then(picture => {
        var img = grayscale(picture);
        var result = new imageSource.ImageSource();
        result.setNativeSource(img);
        billImageView.imageSource = result;
    });
}

function grayscale(image: imageSource.ImageSource) {
    var colorspace = CGColorSpaceCreateDeviceGray();
    // You can create a smaller image here
    var context = CGBitmapContextCreate(null, image.width, image.height, 8, 0, colorspace, CGImageAlphaInfo.kCGImageAlphaNone);
    CGColorSpaceRelease(colorspace);
    // Draw the image
    CGContextDrawImage(context, CGRectMake(0, 0, image.width, image.height), image.ios.CGImage);
    var imgRef = CGBitmapContextCreateImage(context);
    // You can get the gray scale image here
    // We will dump it back to be displayed in the UI
    var img = UIImage.imageWithCGImage(imgRef);
    CGImageRelease(imgRef);
    CGContextRelease(context);
    return img;
}




