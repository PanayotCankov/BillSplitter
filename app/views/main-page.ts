import observable = require("data/observable");
import pages = require("ui/page");
import gestures = require("ui/gestures");
import listView = require("ui/list-view");
import cameraModule = require("camera");

import parties = require("./../parties/parties");

var page;
var nearbyPartiesList: listView.ListView;
var billImageView;

// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    // Get the event sender
    page = <pages.Page>args.object;
    // page.bindingContext = null;
    billImageView = page.getViewById("billImageView");
    nearbyPartiesList = page.getViewById("nearbyPartiesList");
}

export function addImageButtonTap() {
    cameraModule.takePicture().then(picture => {
        console.log("Result is an image source instance");
        billImageView.imageSource = picture;

        // TODO: Advertise party
    });
}

export function searchNearbyParties() {
    // TODO: Search for parties...
    parties.search().then(list => {
        nearbyPartiesList.items = list;
    });
    // TODO: On fail
}