var requestNum = 0;
var fileList = [];
var activeList = {};
//var d = new Date();
//var start = d.getTime()-20*1000;

function getUrl(url, callback){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = process;
	xhr.open("GET", url, true);
	xhr.send();
	
	requestNum++;
	activeList[requestNum] = xhr;

	function process(){
		if (xhr.readyState == 4 && xhr.status == 200){
			var resp = xhr.responseText;
			callback(resp);
		}
		delete activeList[requestNum];
	}
}

function getJSON(url, callback){
	getUrl(url, function(resp){
		callback(JSON.parse(resp));
	});
}

function randRepo(repos){
	return repos.items[Math.floor(Math.random()*repos.items.length)].url
}

function regForLang(lang){
	return new RegExp("\\."+lang+"$");
}

/*function getContents(url, langExp, depth, fileList){
	getJSON(url, function(contents){
		parseContents(contents, langExp, depth, fileList);
	});
}

function parseContents(contents, langExp, depth, fileList){
	for(k in contents){
		var item = contents[k];
		//console.log(item);
		if (item.type == "file" && langExp.test(item.name)){
			fileList.push(item.download_url);
		} else if (item.type == "dir" && depth > 0){
			getContents(item.url, langExp, depth-1, fileList);
		}
	}
}*/

function getTree(url, langExp, depth, fileList){
	var repoName = (/[^\/]*\/[^\/]*$/).exec(url)[0];
	console.log("Scraping "+repoName);
	getJSON(url+'/git/trees/master?recursive='+depth, function(result){
		var files = result.tree;
		for (k in files){
			//console.log(files[k]);
			if (files[k].type == 'blob' && langExp.test(files[k].path)){
				fileList.push('https://raw.githubusercontent.com/'+repoName+'/master/'+files[k].path);
			}
		}
	});
	
}

function getRepos(language, callback){
	getJSON('https://api.github.com/search/repositories?q=language:'+language+'&sort=stars', callback);
}

function getFiles(language, langExtension, depth){
	var langExp = regForLang(langExtension);
	function processRepos(repos){
		getTree(randRepo(repos), langExp, depth, fileList);
	}
	getRepos(language, processRepos);
}

function getRandFile(callback){
	if (fileList.length < 1){
		throw "fileList not populated, why was this called??";
	} else {
		getUrl(fileList[Math.floor(Math.random()*fileList.length)], callback);
	}
}