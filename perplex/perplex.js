/*TODO:
	skipline feature!
	ignore backspace?
*/

var depth = 3;
var language;
var langExt;
var text = '';
var correct = 0;
var total = 0;
var perplexity = 'Unknown!';
lastChar = '\n';

var codeArea = document.getElementById('CodeArea');
var score = document.getElementById('score');
codeArea.focus();

var digramPeekArray = [null, null, null, null, null]
var digramPeekTable = document.getElementById('digram-table');
var digramTable = {}

function keypressed(x){
	if (text.length > 0){
		//nextChar is the next character text
		var nextChar = text.slice(0,1);
		//removes the first character from text
		text = text.slice(1);
		//the actual HTML to be inserted
		var nextHTML = nextChar;
		var charCode = x.charCode;
		//replace "Enter" with "newline"
		if (charCode == 13)
			charCode = 10;
		
		var c = (x.charCode == nextChar.charCodeAt(0)) ? 'g' : 'r';
		
		if (nextChar=='\n')
			nextHTML = '\u2936\n';
		
		if (c=='g')
			correct++;
		
		var insert = '<span class='+c+'>'+nextHTML+'</span>';
		codeArea.innerHTML = codeArea.innerHTML+insert;
		
		total++;
		perplexity = total/correct;
		score.innerHTML = perplexity.toFixed(3);
		
		//console.log(x.charCode);
		digramPeekArray = digramTable[nextChar];
		//update_table();
		
		lastChar = nextChar;
	}
};

function writeCharacters(){
	
}

function skipLine(){
	console.log("Not Yet Implemented!");
}

function processDoc(text){
	//remove carriage returns and replace tabs with spaces
	text = text.replace(/\r/, '');
	text = text.replace(/\t/, '    ');
	return text
}

function newLanguage(){
	codeArea.innerHTML = 'Loading, please wait...';
	language = document.getElementById("language").value;
	langExt = document.getElementById("extension").value;
	for (k in activeList){
		activeList[k].abort();
	}
	fileList = [];
	getFiles(language, langExt, depth);
	function temp(){
		if (Object.keys(activeList).length > 0 || (fileList.length < 1)){
			window.setTimeout(temp, 500);
		} else {
			getRandFile(function(t){
				text = processDoc(t);
				codeArea.innerHTML = 'Type Here!<BR>';
			});
		}
	}
    temp();
    digramTable = populateDigramTable(text, {});
}

function populateDigramTable(text, digram_table) {
    var previous = text.slice(0,1);
    var sum = 0;
    digram_table[previous] = {};
    for (index = 1; index <= text.slice(1).length; index++) {
	var character = text[index];
	if (previous in digram_table) {
	    if (character in digram_table[previous]) {
		digram_table[previous][character] += 1;
	    }
	    else {
		digram_table[previous][character] = 1;
	    }
	}
	else {
	    digram_table[previous] = {};
	    digram_table[previous][character] = 1;
	}
	sum += 1;
	previous = character;
    }
    var sorted_digram_table = {};
    for (item in digram_table) {
	var frequencies = []
	for (item2 in digram_table[item]) {
	    frequencies.push([item2, digram_table[item][item2]]);
	}
	frequencies.sort(compare);
	frequencies.reverse();
	sorted_digram_table[item] = frequencies.slice(0,6);
    }
    return sorted_digram_table;
}

function compare(a, b) {
    if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
    return 0;
}
	
	
newLanguage();
codeArea.onkeypress = keypressed;
