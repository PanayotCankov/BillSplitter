# nativescript-marketplace-demo
Repository used for the NativeScript demo app

# To start
```
npm platform add ios
npm platform add android
tns library add ios app/lib/TesseractOCR.framework
```

Tesseract requires language data files in order to initialize the engine. To setup Tesseract import your tessdata folder (located under ``` app/lib/testdata ``` ) into the root of your project AS A REFERENCED FOLDER.

# To compile the TypeScript
To run TSC, first `npm install` then:
```
node_modules/typescript/bin/tsc -p ./app
```

TODO: Try if this is working:
```
node_modules/typescript/bin/tsc --watch -p ./app
```

> NOTE: Try if this will build and run:
```
node_modules/typescript/bin/tsc -p ./app && tns run ios --emulator --device iPhone-6
```

# To run
```
npm run ios
```