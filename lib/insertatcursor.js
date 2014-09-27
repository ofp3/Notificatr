// Borrowed from http://jsfiddle.net/rmDzu/2/  
// and http://stackoverflow.com/questions/5203428/inserting-text-after-cursor-position-in-text-are%D0%B0

jQuery.fn.extend({
insertAtCaret: function(myValue, myValueE){
  return this.each(function(i) {
    if (document.selection) {
      //For browsers like Internet Explorer
      this.focus();
      sel = document.selection.createRange();
      sel.text = myValue + myValueE;
      this.focus();
    }
    else if (this.selectionStart || this.selectionStart == '0') {
      //For browsers like Firefox and Webkit based
      var startPos = this.selectionStart;
      var endPos = this.selectionEnd;
      var scrollTop = this.scrollTop;
      this.value = this.value.substring(0, startPos)+myValue+this.value.substring(startPos,endPos)+myValueE+this.value.substring(endPos,this.value.length);
      this.focus();
      this.selectionStart = startPos + myValue.length;
      this.selectionEnd = ((startPos + myValue.length) + this.value.substring(startPos,endPos).length);
      this.scrollTop = scrollTop;
    } else {
      this.value += myValue;
      this.focus();
    }
  })
    }
});