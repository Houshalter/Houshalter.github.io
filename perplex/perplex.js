/*TODO:
	skipline feature!
	ignore backspace
Done:
	+process text to remove carriage returns
	+replace tabs with spaces (how many?)
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


function keypressed(x){
	if (text.length > 0){
		//nextChar is the next character text
		var nextChar = text.slice(0,1);
		//removes the first character from text
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
	}
};

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
}
newLanguage();
codeArea.onkeypress = keypressed;