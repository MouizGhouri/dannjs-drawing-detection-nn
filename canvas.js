 const layer = new Layer ('avgpool', (256 * 256), 8, 8);
const drawings = ["Apple", "Basket", "Bicycle", "Eiffel Tower"];

window.addEventListener ("load", () => {

	let canvas = document.querySelector ("#canvas");
	let context = canvas.getContext ("2d");

	canvas.width = "256";
	canvas.height = "256";

	context.lineWidth = 4;
	context.lineCap = "round";

	context.fillStyle = "#FFFFFF";
	context.fillRect (0, 0, 256, 256);

	context.fillStyle = "#000000";

	let drawing = false;

	function startDrawing (n) {
		drawing = true;
		context.beginPath ();
	}

	function stopDrawing (n) {
		drawing = false;
	}

	function draw (n) {
		if (drawing) {
			context.lineTo (n.clientX, n.clientY);
			context.stroke ();
		}
	}

	canvas.addEventListener ("mousemove", (n) => draw (n));

	canvas.addEventListener ("mouseup", (n) => stopDrawing (n));
	canvas.addEventListener ("mousedown", (n) => startDrawing (n)); 

});

function canvasToInput () {

	let context = document.querySelector ("#canvas").getContext ("2d");

	let image_data = [];
	let raw_data = context.getImageData (0, 0, 256, 256).data;

	for (let i = 0; i < raw_data.length; i += 4) {
		image_data.push (raw_data [i] == 255 ? 0 : 1);
	}

	return layer.feed (image_data);

}

function guessDrawing () {

	let guess_data = guessDrawingFromCanvas (canvasToInput ());

	console.log (guess_data);
	console.log (drawings [guess_data.indexOf (Math.max (...guess_data))]);

	return 1;

}