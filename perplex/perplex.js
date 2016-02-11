/*TODO:
	skipline feature!
	test on other browsers!!!
*/

var depth = 3;
var language;
var langExt;
var text = '';
var correct = 0;
var total = 0;
var perplexity = 'Unknown!';
var lastChar = '\n';
var timer;

var codeArea = document.getElementById('CodeArea');
var score = document.getElementById('score');
var checkBox = document.getElementById('timerCheck');
var timeInput = document.getElementById('time');
codeArea.focus();

var digramPeekTable = document.getElementById('digram-table');
var digramTable = {};

function keypressed(x){
	x.preventDefault();
	clearTimeout(timer);
	if (text.length > 0){
		//nextChar is the next character text
		var nextChar = text.slice(0,1);
		
		var charCode = x.charCode;
		
		//replace "Enter" with "newline"
		if (charCode == 13)
			charCode = 10;
		
		var c = (charCode == nextChar.charCodeAt(0)) ? 'g' : 'r';
		
		if (c=='g')
			correct++;
		
		writeCharacter(c);
		
		total++;
		perplexity = total/correct;
		score.innerHTML = perplexity.toFixed(3);
		timerCheck()
	}
};

function writeCharacter(c){
	var nextChar = text.slice(0,1);
	text = text.slice(1);
	var nextHTML = nextChar;
	
	nextHTML = nextHTML.replace('\n', '\u2936\n');
	
	var insert = '<span class='+c+'>'+nextHTML+'</span>';
	codeArea.innerHTML = codeArea.innerHTML+insert;
	
	lastChar = nextChar;
	digramPeekArray = digramTable[lastChar];
	update_table(lastChar, digramPeekArray);
}

function skipLine(){
	clearTimeout(timer)
	while(text.length > 2 && text.slice(0,1) != '\n'){
		writeCharacter('y');
	}
	writeCharacter('y');
	codeArea.focus();
	timerCheck()
}

function processDoc(text){
	//remove carriage returns and replace tabs with spaces
	text = text.replace(/\r/, '');
	text = text.replace(/\t/, '    ');
	return text;
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
				codeArea.innerHTML = 'Type Here!\n';
				digramTable = populateDigramTable(text, {});
				codeArea.focus();
			});
		}
	}
    temp();
}

function populateDigramTable(text, digram_table){
    var previous = '\n';
    digram_table[previous] = {};
    for (i=0;i<text.length;i++){
		var character = text[i];
		digram_table[previous] = digram_table[previous] || {};
		digram_table[previous][character] = digram_table[previous][character] || 0;
		digram_table[previous][character] += 1;
		previous = character;
    }
    var sorted_digram_table = {};
    for (item in digram_table){
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

function update_table(last_char, digram_peek_array){
	if (!digram_peek_array){return;}
	var sum = 0;
    for (index in digram_peek_array) {
		sum += digram_peek_array[index][1];
    }
	for (i=0;i<5;i++){
		var element = document.getElementById('digram'+i);
		var d = digram_peek_array[i];
		if (d){
			//var digram = last_char + d[0];
			var digram = d[0];
			digram = digram.replace(' ', '█').replace('\n', '\u2936');
			var percent = ((d[1] / sum) * 100).toFixed(0)
			element.innerHTML =  digram + ' ' + percent +'%';
		} else {
			element.innerHTML = '<BR>';
		}
	}
}

//prevents backspace behavior
//needs to be tested on other browsers!
codeArea.onkeydown = function (e) {
	if ((e.keyCode==8 || e.keyCode == 9) &&
		(e.target.tagName != "TEXTAREA") && 
		(e.target.tagName != "INPUT")) {
			if (e.keyCode == 9){
				skipLine();
			}
			//e.stopPropagation();
			return false;
	}
};

function ding(){
	if (text.length > 0){
		var c = (digramTable[lastChar][0][0] == text.slice(0,1)) ? 'g' : 'r';
		if (c == 'g')
			correct++;
		writeCharacter(c);
		total++;
		perplexity = total/correct;
		score.innerHTML = perplexity.toFixed(3);
	}
	startTimer();
}

function startTimer(){
	timer = setTimeout(ding, timeInput.value*1000);
}

function timerCheck(){
	clearTimeout(timer);
	if (checkBox.checked){
		startTimer();
	}
}

	
newLanguage();
codeArea.onkeypress = keypressed;
timerCheck();
