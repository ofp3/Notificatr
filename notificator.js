function changeAllTags(source, startChars, endChars) {
	for(var tag in startChars){
		source = changeTags(source, tag, startChars[tag], endChars[tag]);
	}
	console.log(source);
	return source;
}

function changeTags(source, tag, startChar, endChar) {
	while(source.indexOf("\\" + tag) > -1){
		source = source.replace("\\" + tag + "*", endChar + "\n");
		source = source.replace("\\" + tag, startChar);
	}
	return source;
}

function filterTags(source, tag, replacement) {
	var filteredText = "";
	while(source.indexOf("\\" + tag) != -1 && source.indexOf("\\" + tag + "*") != -1) {
		filteredText += source.substring(source.indexOf("\\" + tag), source.indexOf("\\" + tag + "*") + tag.length + 2);
		source = source.substring(source.indexOf("\\" + tag + "*") + (tag.length + 2), source.length);
		filteredText = filteredText.replace("\\" + tag + "*", replacement + "\n\n");
		filteredText = filteredText.replace("\\" + tag, replacement);
	}
	return filteredText;
}