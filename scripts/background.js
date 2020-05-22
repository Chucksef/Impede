
//GLOBAL VARIABLES GO HERE
var elemID;                                                                             //Global storage for Current Element ID
var iconURL = chrome.extension.getURL("icons/icon32.png");                                  //Creates an absolute URL for the script to use

                                                                                    //////HIDE SEVERAL ANNOYING UI ELEMENTS BEFORE FUN STUFF
$(".jobToJobRec_Hide").hide();                                                          //Hides all annoying, hidden, soon-to-be-unhidden divs
$("#serpRecommendations").hide();                                                       //Hides the big recommended jobs block on page load
$("div.related_searches").hide();                                                       //Hides the related searches list at the bottom
$("#i4c_promo_container").remove();                                                     //Hides the Chrome Browser Tool ad
$("div.indeed-apply-popup-bg:not(:has(#indeedapply-modal-preload-container))").remove();//Removes any popups that DO NOT have the modal apply container in them (Actual Jobs to apply to!)

$("button.ia-AddCoverLetter-button").each(function(){
    $(this).click();
})
$(".ia-ResumeMessage-applyLink").on("click", function(e){
    setTimeout(function(){ $("#ia-FilePicker-resume").click(); }, 50);
})
$("body").prepend("<div id='snackbar'>Cover Letter Inserted!</div>");

let iframe = document.querySelector("#vjs-container-iframe");
if (iframe) {
    iframe.setAttribute("scrolling", "yes")
}

//FUNCTIONS GO HERE
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){

        console.log(`request: ${JSON.stringify(request)}\nsender: ${JSON.stringify(sender)}\nsendResponse: ${JSON.stringify(sendResponse)}`);
        
        if (request.cl){
            console.log(sender+" is sending a cover letter. Pasting into");
            let ta = document.querySelector("textarea");
            if (!ta) {
                console.log(`can't find the textarea inside of ${document}`);
            } else {
                ta.value = request.cl;
                ta.select();
                document.execCommand("copy");
                ta.focus();

                setTimeout(()=>{
                    document.execCommand("paste");
                }, 1);
                
                $("#snackbar").addClass("show");
                setTimeout(function(){
                    $("#snackbar").removeClass("show")
                }, 3000);
                return true;
            }
            
        } else if (request.company != undefined) {
            console.log(sender+" is requesting company name and job title.");
            var jobTitle = document.querySelector(".ia-JobInfoHeader-title").innerText;
            var companyName = document.querySelector(".ia-JobInfoHeader-subtitle .ia-JobInfoHeader-multilineSubtitle span").innerText;
            console.log(`sending response: ${companyName} — ${jobTitle}`);
            sendResponse({"company": companyName, "job": jobTitle});
        }
        return true;
})

function updateBlockList(shouldBeBlocked){                                          //////Function to Update the blocked list goes here.....
    chrome.storage.sync.get('blockList', function(impede){                              //Access stored BlockList array thru Chrome Storage API
        var newList;                                                                    //Local variable for this function
        
        if(impede.blockList){                                                           //Check if stored array exists yet
            newList = impede.blockList;                                                 //If so, store it in temporary variable
        } else {
            newList = [];                                                               //If not, use an empty array to start
        }

        for (i=0;i<newList.length;) {                                               //////Iterates over list...
            if(newList[i] == "" || newList[i] == null){                                 //...Checks if an item is empty...
                newList.splice(i,1);                                                    //...Gets rid of that entry...
            }
            else{
                i++;                                                                    //...If not, it just continues to the next one
            }
        }

        while(newList.length > 360){
            newList.splice(0,1);
        }

        if(shouldBeBlocked===true && $.inArray(elemID, newList)==-1){                   //If the element should be on the list, but doesn't exist there yet...
            newList.push(elemID);                                                       //Add it to the list!
        } else if(shouldBeBlocked===false && $.inArray(elemID, newList)>=0) {           //If the element shouldn't be in the list, but it comes back as present...
            newList.splice($.inArray(elemID, newList),1);                               //Remove that item from the list!
        }

        chrome.storage.sync.set({'blockList': newList});                                //Updates Block List with new data
    })
}

function addTwirldown(elem){                                                        //////Function to Add Twirldown Elements GOES HERE......

    //Local variables
        var jobTitle = elem[0].querySelector(".title").innerText;
        var companyName = elem[0].querySelector(".company").innerText;
        if(!companyName){
            companyName = elem.find("span.company").text();
        }
        companyName = companyName.trim();
    
    elem.children("*:not(.impedeMenu)").wrapAll("<details class='impede'></details>");
    elem.children(".impede").prepend("<summary class='impede'><b>" + jobTitle + "</b> — " + companyName + "</summary>");
    elem.children(".impede").css('padding', '0px');
    elem.children("details.impede").css('filter', 'contrast(37%) brightness(145%)');                               //Grays Out the Element

    updateBlockList(true);
}

function removeTwirldown(elem){                                                     //////Function to Remove Twirldown GOES HERE...
    elem.find("summary.impede").remove();                                               //Removes the summary element
    elem.find(".impede").children("div").unwrap();                                      //unwraps each div inside the details.impede element
    elem.children("details.impede").css('filter', '');                                                             //Removes Grayed Out Effect on element

    updateBlockList(false);
}

chrome.storage.sync.get('blockList', function(impede){                              //////Code Block that iterates over all Listings and performs several actions
    $("div.jobsearch-SerpJobCard").each(function(i){                                    //Iterate over all the listings...
        $(this).css('border-right', '4px solid #ffffff');                               //Give everything a white border for alignment purposes...
        if($(this).find("span.iaLabel").length){                                        //If the listing contains the iaLabel span...
            $(this).css('border-right', '4px solid rgb(255, 136, 57)')                            //Add a helpful Color-Coded border...
        }
        if($(this).find("span.sponsoredGray").length){                                  //If we find a sponsor tag in the listing
            $(this).hide();                                                             //Hides that listing
        }
        if($.inArray($(this).attr("id"), impede.blockList)>=0){                         //If our Block List contains the current Listing....
            addTwirldown($(this));                                                      //Block the listing
        }
    });
})



//All the functions for dealing with listings go here....
$("div.jobsearch-SerpJobCard").on({
    mouseenter: function(){
        elemID = $(this).attr("id");
        var thisListing = $("#"+elemID);
        
        //change the highlight color to better-see listing boundaries
        $(this).css('background-color', '#e2f1ff');
        //add a new image to use as a button
        $(this).prepend("\
            <div class='impedeMenu'> \
                <img src='"+iconURL+"' \
                    alt='Click Here to Add/Remove this job from Impede database' \
                    id='impedeButton'> \
                </img> \
            </div> \
        ");

        var impedeButton = document.getElementById("impedeButton");

        //Event Listener for the impede Button (mouse down)
        impedeButton.addEventListener('mousedown',function(){
            //impedeButton.style.filter = "drop-shadow(0px 4px 2px rgba(0,0,0,.6))";
        })
        
        //Event Listener for the impede Button (mouse up)
        impedeButton.addEventListener('mouseup',function(){
            if(thisListing.find("details.impede").length){
                removeTwirldown(thisListing);
            } else {
                addTwirldown(thisListing);
                //thisListing.prepend(thisListing.find("div.impedeMenu"));
            }
        })
    },
    mouseleave: function(){
        $(".impedeMenu").remove();
        $(this).css('background-color','');
    },
    click: function(){
        $(".recommendJobs").hide(); //hides recommended jobs on every click.
    }
})