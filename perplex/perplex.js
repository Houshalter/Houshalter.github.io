/*TODO:
	skipline feature!
	process text to remove carriage returns
	replace tabs with spaces (how many?)
	ignore backspace?
*/

var depth = 3;
var language;
var langExt;
var text = '';
var correct = 0;
var total = 0;
var perplexity = 'Unknown!';

var codeArea = document.getElementById('CodeArea');
var score = document.getElementById('score');
codeArea.focus();

var digramPeekArray = [null, null, null, null, null]
var digramPeekTable = document.getElementById('digram-table');
var digramTable = {}

//https://api.github.com/search/repositories?q=language:JavaScript&sort=stars

function keypressed(x){
	if (text.length > 0){
		var nextChar = text.slice(0,1);
		text = text.slice(1);
		
		var c = (x.charCode == nextChar.charCodeAt(0)) ? 'g' : 'r';
		
		if (nextChar=='\n'){
			nextChar = '\u2936<BR>';
			if (x.charCode == 13)
				c = 'g';
		}
		if (c=='g')
			correct++
		
		var insert = '<span class='+c+'>'+nextChar+'</span>';
		codeArea.innerHTML = codeArea.innerHTML+insert;
		
		total++;
		perplexity = total/correct;
		score.innerHTML = perplexity.toFixed(3);
		
	        console.log(x.charCode);
	        digramPeekArray = digramTable[nextChar];
	        update_table();
	}
};

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
			//console.log("getting random file");
			getRandFile(function(t){
				text = t;
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
