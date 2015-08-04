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
    

    cameraModule.takePicture().then(function (picture) {
        console.log("Result is an image source instance");

        var tesseract = G8Tesseract.alloc().initWithLanguageEngineMode("eng+fra+bul", G8OCREngineMode.G8OCREngineModeTesseractOnly);
        tesseract.pageSegmentationMode = G8PageSegmentationMode.G8PageSegmentationModeAuto;
        tesseract.maximumRecognitionTime = 60.0;
        tesseract.image = picture.ios.g8_blackAndWhite();
        tesseract.recognize();

        console.log(tesseract.recognizedText);

        billImageView.imageSource = picture;
    });
}
exports.addImageButtonTap = addImageButtonTap;
