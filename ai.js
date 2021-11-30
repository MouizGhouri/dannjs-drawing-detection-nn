var fs = require('fs');
var http = require('http');
var dn = require ('dannjs');
var ndjson = require('ndjson');

const { createCanvas } = require ('canvas');

const Dann = dn.dann;
const Layer = dn.layer;
const Matrix = dn.matrix;

const DATASETS = 4;
const DRAWINGS_PER_DATASET = 100000; // Number of drawings to load (per dataset).

const output = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
];

const nn = new Dann (1024, DATASETS);
console.log (">> Neural Network Constructed.");

nn.addHiddenLayer (32);
nn.addHiddenLayer (32);
nn.addHiddenLayer (32);
console.log (">> Hidden Layers Added.");

nn.makeWeights ();
console.log (">> Weights Assigned");

const layer = new Layer ('avgpool', (256 * 256), 8, 8);

function getInput (drawing_data) {
    return (layer.feed (drawingToPixels (drawing_data)));
}

function parseSimplifiedDrawings(fileName, callback) {
  var drawings = [];
  var fileStream = fs.createReadStream(fileName)
  fileStream
    .pipe(ndjson.parse())
    .on('data', function(obj) {
      drawings.push(obj)
    })
    .on("error", callback)
    .on("end", function() {
      callback(null, drawings)
    });
}

function drawingToPixels (drawing) {

    canvas = createCanvas (256, 256);
    context = canvas.getContext ('2d');

    context.lineWidth = 4;

    context.fillStyle = "#FFFFFF";
    context.fillRect (0, 0, 256, 256);

    for (let i = 0; i < drawing.length; i++) {
        context.beginPath ();
        for (let j = 0; j < drawing [i][0].length; j++) {
            context.lineTo (drawing [i][0][j], drawing [i][1][j]);
        }
        context.stroke ();
    }

    let data = [];
    let raw_data = context.getImageData (0, 0, 256, 256).data;

    for (let i = 0; i < raw_data.length; i += 4) {
        data.push (raw_data [i] == 255 ? 0 : 1);
    }

    return data;

}

function saveModel () {
    fs.writeFileSync ('network_function.js', nn.toFunction ().replace ('myDannFunction', 'guessDrawingFromCanvas'), 'utf-8');
    console.log (">> Successfully saved model.");
    return 1;
}

function trainModel (data) {
    for (let i = 0; i < DRAWINGS_PER_DATASET; i++) {
        for (let j = 0; j < DATASETS; j++) {
            console.log ("Image:", i);
            nn.backpropagate (getInput (data [j][i].drawing), output [j], {log: true});
        }
        if (i % 1000 == 0) { saveModel (); }
    }
    saveModel ();
    return 1;
}

console.log ("\n>> Loading datasets...\n");

let datasets = [];
for (let n = 0; n < DATASETS; n++) {
    parseSimplifiedDrawings("ds_" + (n + 1) + ".ndjson", function(error, drawings) {
        if(error) return console.error(error);
        datasets.push (drawings.slice (0, DRAWINGS_PER_DATASET));
        if (datasets.length == DATASETS) { 
          console.log (">> Data Loaded.");
          console.log ("\n>> Training Model...\n");
          trainModel (datasets); 
        }
    });
}

