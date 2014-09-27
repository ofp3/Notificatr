function changeAllTags(source, tagList) {
	for(i = 0; i < tagList.length; i++) {
		source = changeTags(source, tagList[i]);
	}
	return source;
}

function changeTags(source, tag) {
	// source = source.replace("\\" + tag, "<!---" + tag + "--->");
	// source = source.replace("\\" + tag + "*", "<!---" + tag + "*--->");
	while(source.indexOf("\\" + tag) > -1){
		source = source.replace("\\" + tag, "");
		source = source.replace("\\" + tag + "*", "\n");
	}
	return source;
}

function filterTags(source, tag) {
	var filteredText = "";
	while(source.indexOf("\\" + tag) != -1 && source.indexOf("\\" + tag + "*") != -1) {
		filteredText += source.substring(source.indexOf("\\" + tag) + (tag.length + 1), source.indexOf("\\" + tag + "*"));
		source = source.substring(source.indexOf("\\" + tag + "*") + (tag.length + 2), source.length);
		filteredText += "\n";
	}
	return filteredText;
}