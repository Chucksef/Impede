//Global Variables Go Here...
    company = "";
    job = "";
    allCL = [];
    clIdx = [];
    CLtxt = "";

function exportImpede(data){
    var blob = new Blob([data], {type: "text/plain;charset-utf-8"});
    var dateTime = Date.now();
    saveAs(blob, "ImpedeData"+dateTime);
}

function readFile(file, onLoadCallback){
    var reader = new FileReader();
    reader.onload = onLoadCallback;
    reader.readAsText(file)
}

function updateSelectbox(){
    $("option").each(function(index){
        this.remove();
    })
    clIdx = [];
    if(allCL){
        for (i=0;i<allCL.length;i++){
            $("#selectedCL").append("<option value='"+allCL[i].Name+"'>"+allCL[i].Name+"</option>");
            clIdx.push(allCL[i].Name);
            var idx = $.inArray($("#selectedCL").val(), clIdx);
            CLtxt = allCL[idx].Text;
        }
    }
}

$(function(){

    //Basic onLoad cleanup...
        $("#fileInput").hide();
        $(".subMenu").hide();
        $("#mainMenu").show();
        $("#backButton").hide();
    
    //Navigation Functions Go Here...
        $("#backButton").click(function(event){
            $(".subMenu").hide();
            $("#mainMenu").show();
            $("#backButton").hide();
        })

        $("#manageRecords").click(function(event){
            $(".subMenu").hide();
            $("#dataMenu").show();
            $("#backButton").show();
        })
    
        $("#coverLetters").click(function(event){
            $(".subMenu").hide();
            $("#coverLetterMenu").show();
            $("#backButton").show();

            chrome.storage.local.get('CLList', function(impede){
                allCL = impede.CLList;
                updateSelectbox();
            })

            chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id, {"company": "", "position": ""}, function(response){
                    if(chrome.runtime.lastError){
                        console.log("Whoops.. "+chrome.runtime.lastError.message);
                    }
                    else if(response != undefined){
                        company = response.company.replace(/<a.*?>/gmi,"");
                        company = company.replace(/<\/a>/, "").trim();
                        company = company.replace("&amp;","&");
                        job = job.replace("&amp;","&");
                        job = response.job.trim();
                        
                        $("#CompanyName").val(company);
                        $("#JobTitle").val(job);
                        $("#CompanyName").css("color","black");
                        $("#JobTitle").css("color","black");
                    }
                });
            })
        })

        $("#savedJobs").click(function(event){
            $(".subMenu").hide();
            $("#savedMenu").show();
            $("#backButton").show();
        })

    //SCRIPTS FOR MANAGE DATA SUBMENU
        $("#fileInput").on("change", function(){
            readFile(this.files[0], function(e){
                var newList = e.target.result.split(",");
                chrome.storage.sync.set({'blockList': newList});
            })
        })

        $("#importImpede").click(function(event){                                               
            var fileString;
            $("#fileInput").trigger("click");
        })

        $("#exportImpede").click(function(event){
            chrome.storage.sync.get('blockList', function(impede){
                exportImpede(impede.blockList);
            })
        })

        $("#clearImpede").click(function(event){
            var emptyList = [];
            chrome.storage.sync.set({'blockList': emptyList});
        })
    
    //SCRIPTS FOR COVER LETTERS SUBMENU
        $("#selectedCL").change(function(){
            var idx = $.inArray($(this).val(), clIdx);
            CLtxt = allCL[idx].Text;
        })

        $(".inputField").on({
            focus: function(){
                $(this).select();
            },
            keypress: function(e){
                if(e.which == 13){
                    $(this).next("*").focus();
                }
            }
        })

        $("#CompanyName").blur(function(){
            if($(this).val()==""||$(this).val()=="Company Name"){
                $(this).val("Company Name");
                $(this).css("color","");
            } else {
                $(this).css("color","black");
            }
        })

        $("#JobTitle").blur(function(){
            if($(this).val()==""||$(this).val()=="Job Title"){
                $(this).val("Job Title");
                $(this).css("color","");
            } else {
                $(this).css("color","black");
            }
        })

        $("#editCL").click(function(){
            window.open("manageCL.html");
        })

        $("#insertCL").click(function(){
            company = $("#CompanyName").val();
            job = $("#JobTitle").val();
            chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
                CLtxt = CLtxt.replace(/\[job\]/gmi, job);
                CLtxt = CLtxt.replace(/\[company\]/gmi, company);
                chrome.tabs.sendMessage(tabs[0].id, {"cl": CLtxt});
                window.close();

            });
        })

})