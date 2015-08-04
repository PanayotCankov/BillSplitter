import observable = require("data/observable");
import pages = require("ui/page");
import gestures = require("ui/gestures");
 import cameraModule = require("camera");

// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    // Get the event sender
    var page = <pages.Page>args.object;
    // page.bindingContext = null;
}

export function addImageButtonTap() {
    cameraModule.takePicture().then(picture => {
        console.log("Result is an image source instance");
    });
}
