var width = 200;
var height = 100;
var popsize = 20;
var length = 100;
var selected = [[]];
var population = [];
var splitProb = 0.3;
//var mutationRate = 0.5;
var animationFrame = 1;
populationMutationRate = []
var highlighted = [];
var modeSelect = document.getElementById("mode");
var mutationRateSlider = document.getElementById("mutationRateSlider");
var selectedMutationRates = []

for (var i=0;i<=popsize;i++){
    var newdiv = document.createElement('canvas');
    var divIdName = 'member'+i;
    newdiv.setAttribute('id',divIdName);
    newdiv.setAttribute("width", width)
    newdiv.setAttribute("height", height)
    newdiv.setAttribute("style", "border:1px solid #000000;")
	newdiv.setAttribute("onclick", "select("+i+")")
    document.getElementById("theBody").appendChild(newdiv)
}
//Ok so each thing is just an array of points, x and y coordinates, and instructions to draw a line to them
//or just move to that location without drawing a line.
//mutations occur by slightly shifting every point by some probability distribution.
//also some chance of adding new points (and mutating their value at a higher mutation rate)
//or deleting existing ones. Also changing paths from visible to invisible
//mating is more difficult as the length of the sequence can vary as do the individual points.
//a solution is to force them to be the same length
//then crossover is just copying every other point randomly from each. However this limits
//evolution as similar designs can not be created from a single mutation to a single line without
//moving the line. Instead a recursive model might work better. Essentially a single line is
//split into two line segments and then treated as a single entity and two separate sub entities
//another thing two move commands shouldn't be next to each other. Also how do I delete a point
//between two of thse "entities"?
//so the assumption being made here is that the end result is some kind of shape that can be
//drawn from a series of connected line segments. Other ways would be points in space
//or possibly just a bunch of seperate line segments or just shapes even
//just a set of turtle instructions isn't enough though because of the split line issue
//as long as mutations can insert new points it shouldn't be an issue though However recombining
//them becomes complicated.

//for now at least, drawings will be represented in this format:
//pointToDrawLineTo OR [drawing, drawing]
//lines are represented as {x: num, y: num, draw: bool}

//The algorithm is this. Create a random population of images. Whenever the user clicks select runs on the
//image that was pressed. Select creates a new population

function start(){
	population = createRandomPopulation();
	drawAll();
	animate();
}

function animate(){
	if (selected.length > 2){
		draw(0, pick(selected[animationFrame-1]));
		animationFrame++;
		if (animationFrame>selected.length-1){
			animationFrame = 1;
		}
	}
	setTimeout(animate, 300);
}

//mutationRate = {deleteProb: 0.5, newPoint: blah, draw: , sd:}
function createRandomPopulation(){
	var randomPop = [];
	for (var i = 0;i<popsize;i++){
		//var mutationRate = {deleteProb: Math.random()*0.2, newPoint: Math.random()*0.1, draw: Math.random()*0.1, sd: Math.random()*25};
		var mutationRate = {deleteProb: 0.05018636957975105, newPoint: 0.10656508930958808, draw: 0.0668902442988474, sd: 1.729090504348278}
		populationMutationRate.push(mutationRate);
		randomPop.push(createRandomDrawing(mutationRate));
	}
	return randomPop;
}

function createRandomDrawing(mutationRate){
	if (false){
	
	} else {
		return mutate({x: random(1, width), y: random(1, height), draw: flip()}, mutationRate);
	}
}

function newPopulation(){
	//mutationRate = Number(mutationRateSlider.value);
	for (i=1;i<=popsize;i++){
		dehighlight(i)
	}
	for (var i=0;i<popsize;i++){
		var gen = selected[selected.length-1];
		var newmemNum1 = random(0, gen.length-1);
		var newmemNum2 = random(0, gen.length-1);
		var newmem1 = gen[newmemNum1];
		var newmem2 = gen[newmemNum2];
		var mutationRate = mutateMutationRate(mateMutationRate(selectedMutationRates[newmemNum1], selectedMutationRates[newmemNum1]))
		var newmem = mate(newmem1, newmem2);
		populationMutationRate[i] = mutationRate;
		population[i] = mutate(newmem, mutationRate);
	}
	if (selected[selected.length-1].length > 0) {
		selected.push([]);
	}
}

function mutateMutationRate(mutationRate){
	for (k in mutationRate){
		if (k != "sd"){
			mutationRate[k] = blur(mutationRate[k], 0.5, 0.005);
		}
	}
	mutationRate.sd = blur(mutationRate.sd, 200, 0.5)
	return mutationRate;
}

//mutationRate = {deleteProb: 0.5, newPoint: blah, draw: , sd:}
function mateMutationRate(a, b){
	returnVal = {};
	for (k in a){
		returnVal[k] = (a[k] + b[k])/2;
	}
	return returnVal;
}

function pick(array){
	return array[random(0, array.length-1)];
}

//pointToDrawLineTo OR [drawing, drawing]
//lines are represented as {x: num, y: num, draw: bool}
//mutationRate = {deleteProb: 0.5, newPoint: blah, draw: , sd:)
function mutate(drawing, mutationRate){
	var returnval;
	if (Array.isArray(drawing)){
		if (Math.random() < mutationRate.deleteProb){
			returnval = mutate(drawing[random(0,1)], mutationRate);
		} else {
			returnval = [mutate(drawing[0], mutationRate), mutate(drawing[1], mutationRate)];
		}
	} else {
		if (Math.random()<mutationRate.newPoint){
			returnval = [createRandomDrawing(mutationRate)/*{x: blur(drawing.x, width), y: blur(drawing.y, height), draw: flip()}*/, mutate(drawing, mutationRate)]
		} else {
			returnval = {x: blur(drawing.x, width, mutationRate.sd), y: blur(drawing.y, height, mutationRate.sd), draw: ((Math.random()<mutationRate.draw) ? !drawing.draw : drawing.draw)};
		}
	}
	//console.log(returnval, drawing)
	return returnval;
}

function blur(b, max, sd){
	var newVal = guass(sd)+b;
	if (newVal > max){
		return max;
	} else if (newVal < 0){
		return 0;
	} else {
		return newVal;
	}
	/*var newVal = b+((Math.random()*mutationRate*100)-50)*Math.random()*Math.random()*Math.random()*Math.random();
	if (newVal < 0 || newVal > max){
		newVal = random(0, max);
	}
	return newVal*/
}

function guass(sd){
	var total = 0;
	for (i = 1;i<=12;i++){
		total += Math.random();
	}
	return (total-6)*sd
}

function select(n){
	if (n == -1) {
		console.log("New Generation!")
		newPopulation();
		drawAll();
	//IF N IS > 0 THEN THE ANIMATION FRAME SHOULD BE ADDED TOO THE SELECTED
	}else if (modeSelect.value == "multiple" && n > 0){
		console.log(n, population[n-1])
		console.log(populationMutationRate[n-1])
		selectedMutationRates.push(populationMutationRate[n-1])
		selected[selected.length-1].push(population[n-1])
		highlight(n)
	
	//POSSIBLE ERROR HERE IF SELECTED.LENGTH ISN'T > 1
	} else if (n==0 && selected.length > 1){
		var mem = selected[animationFrame-1];
		console.log(n, mem);
		selected.pop();
		
		//CHANGED THIS LINE CHECK FOR ERRORS
		selected.push([mem]);
		newPopulation();
		drawAll();
	} else {
		console.log(n, population[n-1])
		console.log(populationMutationRate[n-1])
		selectedMutationRates.push(populationMutationRate[n-1])
		selected[selected.length-1].push(population[n-1]);
		newPopulation();
		drawAll();
	}
}

function highlight(n){
	highlighted[n] = true
	var canvas = document.getElementById("member"+n);
	canvas.style.border = "5px solid rgb(0, 0, 255)"
}

//pointToDrawLineTo OR [drawing, drawing]
//lines are represented as {x: num, y: num, draw: bool}
function mate(drawing1, drawing2){
	if (Array.isArray(drawing1) && Array.isArray(drawing2)){
		var i = 0;
		var newArray = [];
		while (true){
			if (drawing1.length-1 < i && drawing2.length-1 < i){
				break;
			} else if (drawing1.length-1 < i){
				if (flip()){
					newArray.push(drawing1[i]);
				} else {
					break;
				}
			} else if (drawing2.length-1 < i){
				if (flip()){
					newArray.push(drawing2[i]);
				} else {
					break;
				}
			} else {
				newArray.push(mate(drawing1[i], drawing2[i]));
			}
			i++;
		}
		return newArray;
	} else if (!Array.isArray(drawing1) && !Array.isArray(drawing2)){
		return {x: (drawing1.x + drawing2.x)/2, y: (drawing1.y + drawing2.y)/2, draw: pick([drawing1.draw, drawing2.draw])};
	} else {
		return pick([drawing1, drawing2])
	}
}

function dehighlight(n){
	highlighted[n] = false
	var canvas = document.getElementById("member"+n);
	canvas.style.border = "1px solid rgb(0, 0, 0)"
}


function drawAll(){
	for (var i=1;i<=popsize;i++){
		draw(i, population[i-1])
	}
}
 
function draw(memberNum, member){
	var canvas = document.getElementById("member"+memberNum);
	var canvasContext = canvas.getContext("2d");
	canvasContext.clearRect(0,0, width, height);
	canvasContext.beginPath();
	canvasContext.moveTo(Math.round(width/2), Math.round(height/2));
	var path = getPath(member);
	for (var i=0;i<path.length;i++){
		var point = path[i];
		if (point.draw){
			canvasContext.lineTo(point.x, point.y)
		} else {
			canvasContext.moveTo(point.x, point.y)
		}
	}
	canvasContext.stroke();
}

//pointToDrawLineTo OR [drawing, drawing]
//lines are represented as {x: num, y: num, draw: bool}
function getPath(member){
	if (Array.isArray(member)){
		return getPath(member[0]).concat(getPath(member[1]))
	} else {
		return [member]
	}
}

function random(start, stop){
	return Math.round((Math.random()*(stop-start))+start);
}

function flip(){
	return Math.random() < 0.5;
}

start()