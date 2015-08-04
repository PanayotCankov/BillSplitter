var cameraModule = require("camera");
var page;
var billImageView;
function pageLoaded(args) {
    page = args.object;
    billImageView = page.getViewById("billImageView");
}
exports.pageLoaded = pageLoaded;
function addImageButtonTap() {
    // This is here only for testing
    var test = G8Tesseract.alloc().init();
    console.log(test);

    cameraModule.takePicture().then(function (picture) {
        console.log("Result is an image source instance");
        billImageView.imageSource = picture;
    });
}
exports.addImageButtonTap = addImageButtonTap;
