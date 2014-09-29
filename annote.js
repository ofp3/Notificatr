        var LIST_OF_TAGS = ["eq", "thm", "img", "h1"];
        var STARTING_CHARS = {"eq": "$eq$", "thm": "", "img": "![](files/", "h1": "", "h2": "", "h3": "###"};
        var ENDING_CHARS = {"eq": "$eq$", "thm": "", "img": " \"\")", "h1": "\n===", "h2": "\n---", "h3": "###"};

        jQuery(document).ready(function() {
            jQuery('.tabs .tab-links a').on('click', function(e)  {
                var currentAttrValue = jQuery(this).attr('href');
         
                // Show/Hide Tabs
                jQuery('.tabs ' + currentAttrValue).show().siblings().hide();
         
                // Change/remove current tab to active
                jQuery(this).parent('li').addClass('active').siblings().removeClass('active');
         
                e.preventDefault();
            });
        });

        $(window).bind('keydown', function(event) {
            if (event.ctrlKey || event.metaKey) {
                switch (String.fromCharCode(event.which).toLowerCase()) {
                case 's':
                    event.preventDefault();
                    saveToFile('raw');
                    break;
                }
            }
        });

        function updateCompiled(){
            document.getElementById('compiled').innerHTML = markdown.toHTML(changeAllTags(document.getElementById("editor").value, STARTING_CHARS, ENDING_CHARS));
            generic();
        }

        function showOutline() {
            document.getElementById('tab2').innerHTML = markdown.toHTML(makeOutline(document.getElementById("editor").value));
        }
        function showTheorems() {
            document.getElementById("tab3").innerHTML = markdown.toHTML(changeAllTags(filterTags(document.getElementById("editor").value, "thm", STARTING_CHARS["thm"]), STARTING_CHARS, ENDING_CHARS));
            generic();
        }
        function showEquations() {
            document.getElementById("Equations").innerHTML = markdown.toHTML(filterEqns(document.getElementById("editor").value, STARTING_CHARS["eq"]));
            generic();
        }
        function addTheorem() {
            $('#editor').insertAtCaret("\\thm "," \\thm*");
        }
        function addEquation() {
            $('#editor').insertAtCaret("\\eq "," \\eq*");
        }
        function addHead(size) {
            $('#editor').insertAtCaret("\\h"+size+' ', " \\h"+size+"*")
        }
        function addBold() {
            $('#editor').insertAtCaret("**","**");
        }
        function addItalic() {
            $('#editor').insertAtCaret("*","*");
        }
        function addQuote() {
            $('#editor').insertAtCaret('> ','');
        }
        function addCode() {
            $('#editor').insertAtCaret('```\n','\n```');
        }
        function addHR() {
            $('#editor').insertAtCaret('---','');
        }
        function addLink() {
            url = prompt("Enter url","http://");
            $('#editor').insertAtCaret("[Link text","]("+url+")");
            updateCompiled();
        }
        function addImage() {
            document.getElementById("image_input").click();
        }
        function imageSubmitted(){
            document.getElementById('imageForm').submit();
            var full_filepath = document.getElementById('image_input').value;
            var filename = full_filepath.substr(full_filepath.lastIndexOf("\\") + 1, full_filepath.length);
            $('#editor').insertAtCaret("\\img" + filename + "\\img*", "");
            updateCompiled();
        }
        function saveToFile(type){
            $.post("/File", {notebookName: $('#notebook_select').val(), fileName: $('#file_select').val(), data: $('#editor').val()},
            function(data){
                window.alert("Successfully saved to file!");
            });
        }
        function printPDF(){
            $.post('/printerFriendly', {data: $('#compiled').html()}, function(){
                window.open('printerFriendly');
            });
        }
        function notebook_select_changed(){ 
            $('.from_listing').remove();
            if($('#notebook_select').val() == ""){
                $('#file_select').attr('disabled', 'disabled'); // Change file_select state
                $('#title_label').css('display', 'initial');
                $('#file_select_button').text('Create');// Change file_select_button state
                $('#create_text').css('display', 'initial');// Change create_text state
            }else{
                $('#file_select').removeAttr('disabled');   //Change file_select state
                $.get('/Notebook', function(result){
                    var i = 0;
                    while(i < result.length && result[i].title != $('#notebook_select').val())
                        i++;
                    if(i != result.length)
                        for(var j = 0; j < result[i].children.length; j++)
                            $('#file_select').html($('#file_select').html() + "<option class='from_listing' val='" + result[i].children[j].file_name + 
                                "'>" + result[i].children[j].file_name + "</option>");
                });
            }
        }
        function file_select_changed(){
            if($('#file_select').val() == ""){
                $('#title_label').css('display', 'initial');
                $('#file_select_button').text('Create');// Change file_select_button state
                $('#create_text').css('display', 'initial');// Change create_text state
            }
            else{
                $('#title_label').css('display', 'none');
                $('#file_select_button').text('Open');// Change file_select_button state
                $('#create_text').css('display', 'none');// Change create_text state
            }

        }
        function file_select_button_clicked(){
            $('#editor').html("");
            $('#compiled').html("");
            if($('#notebook_select').val() == ""){
                //create notebook
                $.post('/Notebook', {notebookName: $('#create_text').val()}, function(result){
                    alert("New Notebook " + result + " created!");
                    //Add the new notebook option selected to the notebook_select
                    $('#notebook_select').html($('#notebook_select').html() + "<option class='from_listing' val='" + result + "'selected>" + result + "</option>");
                    notebook_select_changed();
                });
            }
            else if($('#file_select').val() == ""){
                //create note
                $.post('/File', {notebookName: $('#notebook_select').val(), fileName: $('#create_text').val(), data: ""}, function(result){
                    alert("New Note " + result + " created!");
                    //Add the new note option selected to the file_select
                    $('#file_select').html($('#file_select').html() + "<option class='from_listing' val='" + result + "'selected>" + result + "</option>");
                    file_select_changed();
                });
            }
            else{
                $.get('/File?notebookName='+$('#notebook_select').val()+'&fileName='+$('#file_select').val(), function(result){
                    $('#editor').val(result);
                    updateCompiled();
                });
            }
        }
        function toggleDiv() {
            if( $("#help_hover_div").css("display") == "none") {
                $("#help_hover_div").css("display", "initial");
                $("#help_button").css("background", "white");
                $("#help_button").removeClass("inactive");
                $("#help_button").addClass("active");
            }
            else {
                $("#help_hover_div").css("display", "none");
                $("#help_button").css("background", "#7FB5DA");
                $("#help_button").removeClass("active");
                $("#help_button").addClass("inactive");
            }
        }
        function disconnect() {
            $.get('/logout');
            gapi.auth.signOut();
            document.getElementById('signinButton').setAttribute('style', 'display: "initial"');
            $("#sign_out_button").css("display", "none");
        }

        var user_id;

        function loginFinishedCallback(authResult) {
            if (authResult) {
                if (authResult['error'] == undefined){
                    gapi.client.load('plus','v1', loadProfile);  // Trigger request to get the email address.
                    document.getElementById('signinButton').setAttribute('style', 'display: none');
                    $("#sign_out_button").css("display", "initial");
                } else if (authResult['user_signed_out']) {
                    console.log("g+ connection lost");
                }
                else {
                    console.log('An error occurred');
                    console.log(authResult);
                }
            } else {
                console.log('Empty authResult');  // Something went wrong
            }
        }

        /**
         * Uses the JavaScript API to request the user's profile, which includes
         * their basic information.
         */
        function loadProfile(){
            var request = gapi.client.plus.people.get( {'userId' : 'me'} );
            request.execute(loadProfileCallback);
        }
        function loadEverything(){
            $.get('/Notebook', function(result){
                var arr = result; /*JSON.parse(result);*/
                for(var i = 0; i < arr.length; i++)
                    $('#notebook_select').html($('#notebook_select').html() + "<option val='" + arr[i].title + "'>" + arr[i].title + "</option>");
            });
        }
        function loadProfileCallback(obj) {
            user_id = obj["id"];

            //THIS IS THE ID
            console.log(user_id);
            //ITS HERE
            $.get("/login/"+user_id, function(result){
                loadEverything();
            });
        }
