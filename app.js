const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const dirImgName = './img/';

const addTextWatermarkToImage = async function (inputFile, outputFile, text) {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const textData = {
      text: text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };

    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    await image.quality(100).writeAsync(outputFile);
  }
  catch (error) {
    // console.log(error); 
    console.log('Something went wrong... Try again.')
  }
};

const addImageWatermarkToImage = async function (inputFile, outputFile, watermarkFile) {
  try {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;

    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });
    await image.quality(100).writeAsync(outputFile);
  }
  catch (error) {
    console.log('Something went wrong... Try again.')
  }
};

const prepareOutputFilename = (filename) => {
  // const file_split = filename.split('.');
  // return file_split[0] + '-with-watermark' + file_split[1];
  const [name, ext] = filename.split('.');
  return `${name}-with-watermark.${ext}`;

}

const otherImageConversions = async function (inputFile, outputFile, type) {
  try {
    const image = await Jimp.read(inputFile);
    if (type === 'contrast') await image.contrast(1).writeAsync(outputFile);
    if (type === 'brightness') await image.brightness(0.5).writeAsync(outputFile);
    if (type === 'greyscale') await image.greyscale().writeAsync(outputFile);
    if (type === 'invert') await image.invert().writeAsync(outputFile);
  }
  catch (error) {
    console.log('Something went wrong... Try again.')
  }
}

const startApp = async () => {

  // Ask if user is ready
  const answer = await inquirer.prompt([{
    name: 'start',
    message: 'Hi! Welcome to "Watermark manager". Copy your image files to `' + dirImgName + '` folder. Then you\'ll be able to use them in the app. Are you ready?',
    type: 'confirm'
  }]);

  // if answer is no, just quit the app
  if (!answer.start) process.exit();

  // ask about input file and watermark type
  // const options = await inquirer.prompt([{
  //   name: 'inputImage',
  //   type: 'input',
  //   message: 'What file do you want to mark?',
  //   default: 'test.jpg',
  // }, {
  //   name: 'watermarkType',
  //   type: 'list',
  //   choices: ['Text watermark', 'Image watermark'],
  // }]);

  const options = await inquirer.prompt([{
    name: 'inputImage',
    type: 'input',
    message: 'What file do you want to mark?',
    default: 'test.jpg',
  }]);

  const optionsOther = await inquirer.prompt([{
    name: 'type',
    type: 'list',
    message: 'Do you want to edit a photo?',
    choices: ['No', 'Make image brighter', 'Increase contrast', 'Make image B&W', 'Invert image'],
  }]);

  const originalImage = dirImgName + options.inputImage;
  const outputImage = dirImgName + prepareOutputFilename(options.inputImage);
  let inputImage = dirImgName + options.inputImage; 

  switch (optionsOther.type) {
    case 'Make image brighter':
      if (fs.existsSync(originalImage))
        otherImageConversions(inputImage, outputImage, 'brightness');
      else
        console.log('Something went wrong... Try again.');
      break;
    case 'Increase contrast':
      if (fs.existsSync(originalImage)) 
        otherImageConversions(inputImage, outputImage, 'contrast');
      else
        console.log('Something went wrong... Try again.');
      break;
    case 'Make image B&W':
      if (fs.existsSync(originalImage))
        otherImageConversions(inputImage, outputImage, 'greyscale');
      else
        console.log('Something went wrong... Try again.');
      break;
    case 'Invert image':
      if (fs.existsSync(originalImage))
        otherImageConversions(inputImage, outputImage, 'invert');
      else
        console.log('Something went wrong... Try again.');
      break;
  }

  if (optionsOther.type !== 'No') inputImage = dirImgName + prepareOutputFilename(options.inputImage);

  const optionsWatermark = await inquirer.prompt([{
    name: 'type',
    type: 'list',
    message: 'How the type of watermark?',
    choices: ['Text watermark', 'Image watermark'],
  }]);




  if (optionsWatermark.type === 'Text watermark') {
    const text = await inquirer.prompt([{
      name: 'value',
      type: 'input',
      message: 'Type your watermark text:',
    }])
    options.watermarkText = text.value;

    if (fs.existsSync(originalImage))
      addTextWatermarkToImage(inputImage, outputImage, options.watermarkText);
    else
      console.log('Something went wrong... Try again.');
  }
  else {
    const image = await inquirer.prompt([{
      name: 'filename',
      type: 'input',
      message: 'Type your watermark name:',
      default: 'logo.png',
    }])
    options.watermarkImage = image.filename;
    if (fs.existsSync(originalImage) && fs.existsSync(dirImgName + options.watermarkImage))
      addImageWatermarkToImage(inputImage, outputImage, dirImgName + options.watermarkImage);
    else
      console.log('Something went wrong... Try again.');
  }
  console.log('The action was successful ... Try again.');
  startApp();
};

startApp();