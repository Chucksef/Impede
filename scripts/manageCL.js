
//GLOBAL VARIABLES HERE...
    var allCL = [];
    var clIdx = [];

//ALL FUNCTIONS GO HERE...
    function Coverletter(name, text) {
        this.Name = name;
        this.Text = text;
    }

    function updateSelectbox(){
        $("option").each(function(index){
            if(index>0){
                this.remove();
            }
        })
        clIdx = [];
        for (i=0;i<allCL.length;i++){
            $("#selectedCL").append("<option value='"+allCL[i].Name+"'>"+allCL[i].Name+"</option>");
            clIdx.push(allCL[i].Name);
        }
    }

//THIS RUNS ON LOAD...
$(function(){
    $("#confirmButton").hide();

    chrome.storage.local.get("CLList", function(impede){             //Get Initial Coverletters from Cloud
        if(impede.CLList){
            allCL = impede.CLList;
            updateSelectbox();
        }
    })

    //DOM Level Button Functions
    $("#newButton").click(function(){
        $("#instructions").html("1) Enter a UNIQUE name for this new cover letter above<br/>2) Paste or type a new cover letter into this field<br/>3) Make sure to insert [COMPANY] and [JOB] in appropriate locations<br/>4) Hit 'Save' above to add it to your list!");
        $("#newCLName").removeAttr("disabled");
        $("#newCLName").attr("class","");
        $("#newButton").attr({"disabled":"disabled","class":"menuButton disabled"});
        $("#selectedCL").attr({"disabled": "disabled", "class":"selectbox disabled"});
        $("#newCLName").focus();
        $("#newCLName").select();
    })

    $("#cancelButton").click(function(){
        location.reload();
    })

    $("#deleteButton").click(function(){
        $("#deleteButton").hide();
        $("#confirmButton").show();
    })

    $("#confirmButton").click(function(){
        var deleteIndex = $.inArray($("#selectedCL").val(), clIdx);
        console.log("You had "+clIdx.length+" items in the list...");
        allCL.splice(deleteIndex);
        console.log("ITEM(s) DELETED");
        console.log("You now have "+clIdx.length+" items in the list");
        chrome.storage.local.set({'CLList':allCL});
        location.reload();
    })

    $("#saveButton").click(function(){
        if($("#textEditor").val() == ""){
            alert("Cover letters may not be blank!");
            $("#textEditor").select();
        } else {
            var currentCL = new Coverletter($("#newCLName").val(), $("#textEditor").val());
            var replaced = false;
            for(i=0;i < allCL.length ;i++){
                if(currentCL.Name == allCL[i].Name){
                    allCL[i] = currentCL;
                    replaced = true;
                    alert("Overwriting: "+currentCL.Name);
                    break;
                }
            }
            if(replaced==false){
                allCL.push(currentCL);
            }
    
            chrome.storage.local.set({'CLList':allCL});
            location.reload();
        }
    })

    $("#selectedCL").change(function(){
        var idx = $.inArray($(this).val(), clIdx);
        $("#textEditor").text(allCL[idx].Text);
        $("#newCLName").val($(this).val());
    })
})