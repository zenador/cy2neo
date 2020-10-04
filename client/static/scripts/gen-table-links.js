function getLinkHeader(properties, labels, id) {
	var text = ''; // keep this for no links
	text = '<a href="/table/1">'; // just to show it can link somewhere
	/*
	// example of generating links based on the vertex properties and labels
	if ("propertyname" in properties && labels.length > 0 && labels.indexOf("Category") != -1) {
		text = '<a href="/q?propertyname='+encodeURI(properties["propertyname"])+'">';
	}
	*/
	return text;
}

function getLinkHeaderRel(properties, label, source, target) {
	var text = ''; // keep this for no links
	text = '<a href="/table/1">'; // just to show it can link somewhere
	/*
	// example of generating links based on the edge properties and label
	if ("propertyname" in properties && label == "Category") {
		text = '<a href="/q?propertyname='+encodeURI(properties["propertyname"])+'">';
	}
	*/
	return text;
}

function copyTextToClipboard(text) {
	var $temp = $("<textarea>");
	$("body").append($temp);
	$temp.val(text).select();
	document.execCommand("copy");
	$temp.remove();
}

function copyElementToClipboard(element) {
	copyTextToClipboard($(element).val());
}
