// regex index of function used in makeOutline
String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

// repeat function used in makeOutline
String.prototype.repeat = function( num )
{
    return new Array( num + 1 ).join( this );
}

function changeAllTags(source, startChars, endChars) {
	for(var tag in startChars){
		source = changeTags(source, tag, startChars[tag], endChars[tag]);
	}
	return source;
}

function changeTags(source, tag, startChar, endChar) {
	while(source.indexOf("\\" + tag) > -1){
		source = source.replace("\\" + tag + "*", endChar);
		source = source.replace("\\" + tag, "\n" + startChar);
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

function filterEqns(source, replacement) {
	var count = 0;
	var filteredText = "";
	while(source.indexOf("\\eq") != -1 && source.indexOf("\\eq*") != -1) {
		count++;
		filteredText += source.substring(source.indexOf("\\eq"), source.indexOf("\\eq*") + 5);
		source = source.substring(source.indexOf("\\eq*") + 5, source.length);
		filteredText = filteredText.replace("\\eq*", replacement + "\n\n");
		filteredText = filteredText.replace("\\eq", count + " " + replacement);
	}
	return filteredText;
}

function makeOutline(source) {
	var filteredText = "";
	while(source.regexIndexOf(/\\h[123]/, 0) != -1 && source.regexIndexOf(/\\h[123]\*/, 0) != -1) {
		filteredText += source.substring(source.regexIndexOf(/\\h[123]/, 0), source.regexIndexOf(/\\h[123]\*/, 0) + 4);
		source = source.substring(source.regexIndexOf(/\\h[123]\*/, 0) + 4, source.length);
		var headerlevel = filteredText.match(/\\h[123]\*/)[0].charAt(2);
		filteredText = filteredText.replace(/\\h[123]\*/, "\n\n");
		filteredText = filteredText.replace(/\\h[123]/, "    ".repeat(headerlevel-1) + "* ");
	}
	return filteredText;
}