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


function keypressed(x){
	if (text.length > 0){
		var nextChar = text.slice(0,1);
		text = text.slice(1);
		
		var c;
		if (x.charCode == nextChar.charCodeAt(0)){
			c = 'g';
			correct++;
		} else {
			c = 'r';
		}
		nextChar = (nextChar=='\n')?'\u2936<BR>':nextChar;
		
		var insert = '<span class='+c+'>'+nextChar+'</span>';
		codeArea.innerHTML = codeArea.innerHTML+insert;
		
		total++;
		perplexity = total/correct;
		score.innerHTML = perplexity.toFixed(3);
		
		console.log(x.charCode);
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
}
newLanguage();
codeArea.onkeypress = keypressed;