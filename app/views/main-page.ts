import observable = require("data/observable");
import pages = require("ui/page");
import gestures = require("ui/gestures");
import cameraModule = require("camera");

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
        console.log("Result is an image source instance");
        billImageView.imageSource = picture;
    });
}
