var jq = jQuery.noConflict();
//jq( document ).ready(function() {
jq( document ).on( 'pageinit', '#newOeeLogPage' ,function(event){

        
   
    var selectedPlantId="";
    var plantName="";
    var selectedWorkCenterId="";
    var selectedWorkCenter="";
    
    var selectedEquipmentId=""
    var selectedEquipment="";
    
    var selectedShift="";
    var prdLead="";
    var prdDate="";
    
    var totDowntime = 0;
    var totActualQty = 0;
    var totTargetQty = 0;
    var totGoodQty = 0;
    var totScrapQty = 0;
    var netOperatingTime = 0;

    var availability = 0;
    var performance = 0;
    var quality =0;
    var oee = 0;
    
    jq("#newOeeLogPage").on( 'pagebeforeshow',function(event){
        //CLEAR FORM
        jq("#plantSelect_Sp option").remove();
        jq("#plantSelect_Sp").selectmenu('refresh');
        jq("#workCenterSelect_Sp option").remove();
        jq("#workCenterSelect_Sp").selectmenu('refresh');
        jq("#equipmentSelect_Sp option").remove();
        jq("#equipmentSelect_Sp").selectmenu('refresh');
        jq("#shiftSelect_Sp option").remove();
        jq("#shiftSelect_Sp").selectmenu('refresh');
        jq("#prdLeadInput").val("");
        jq("#prdDateInput").val("");
        
        jq("#notTxt").text("");
        jq("#dtTxt").text("");
        jq("#targetQtyTxt").text("");
        jq("#actualQtyTxt").text("");
        jq("#goodQltTxt").text("");
        jq("#qtyScrpTxt").text("");
        
        
    }); //end pagebeforeshow newOeeLogPage

    
    
    /* *******************************************************
	* Query Production, Downtime, Quality, Plants, Workcenter, Equipment, and Shift
	********************************************************* */
	jq( '#newOeeLogPage' ).on( 'pageshow',function(event){
        //QUERY PLANT LIST AND POPULATE SELECT BOX
        LeanMfgApps.OeeController.queryPlants(function(result, event) {
            if (event.status) {
                jq.mobile.loading( "hide");
                var l = jq("#plantSelect_Sp option").length;
                if(l == 0){
                    jq("<option>").attr( "value", "Prompt").text("---Select a Plant---").appendTo("#plantSelect_Sp");
                    jq("#plantSelect_Sp").selectmenu('refresh');
                    for(var i=0; i<result.length; i++){                             
                        jq("<option>").attr( "value", result[i].Id).text(result[i].LeanMfgApps__Plant_Name__c).appendTo("#plantSelect_Sp");                       
                    };
                }
            } else if (event.type === 'exception') {
                document.getElementById("spError").innerHTML = event.message;
            } else {
                document.getElementById("spError").innerHTML = event.message;
            }
        }, {escape:true}); //end queryPlants
    
        jq("#plantSelect_Sp").change(function(){
            jq.mobile.loading( "show");
            selectedPlantId = jq("#plantSelect_Sp").val();
            plantName = jq("#plantSelect_Sp option:selected").text();
            jq("#plantNameTxt").text(plantName);
            
            //QUERY WORK CENTER LIST AND POPULATE SELECT BOX
            LeanMfgApps.OeeController.queryWorkCenters(selectedPlantId, function(result, event) {
                //alert(event.status+" "+selectedPlant);
                if (event.status) {
                    jq.mobile.loading( "hide");
                    jq("#workCenterSelect_Sp option").remove();
                    var l = jq("#workCenterSelect_Sp option").length;
                    if(l == 0){
                        jq("<option>").attr( "value", "Prompt").text("---Select a Work Center---").appendTo("#workCenterSelect_Sp");
                        jq("#workCenterSelect_Sp").selectmenu('refresh');
                        for(var i=0; i<result.length; i++){                             
                            jq("<option>").attr( "value", result[i].Id).text(result[i].LeanMfgApps__Name__c).appendTo("#workCenterSelect_Sp");                       
                        };
                    }
                } else if (event.type === 'exception') {
                    document.getElementById("spError").innerHTML = event.message;
                } else {
                    document.getElementById("spError").innerHTML = event.message;
                }
            }, {escape:true});  //end queryWorkCenters
        }); // end plant change event
    
    
        jq("#workCenterSelect_Sp").change(function(){
            jq.mobile.loading( "show");
            selectedWorkCenter = jq("#workCenterSelect_Sp option:selected").text();
            selectedWorkCenterId= jq("#workCenterSelect_Sp").val();
            jq("#wcNameTxt").text(selectedWorkCenter);
            
            //QUERY SHIFT CODES LIST AND POPULATE SELECT BOX
            LeanMfgApps.OeeController.queryShiftCodes(plantName, selectedWorkCenter, function(result, event) {
                //alert(event.status+" "+selectedWorkCenter);
                if (event.status) {
                    jq.mobile.loading( "hide");
                    jq("#shiftSelect_Sp option").remove();
                    var l = jq("#shiftSelect_Sp option").length;
                    if(l == 0){
                        jq("<option>").attr( "value", "Prompt").text("---Select a Shift---").appendTo("#shiftSelect_Sp");
                        jq("#shiftSelect_Sp").selectmenu('refresh');
                        for(var i=0; i<result.length; i++){                             
                            jq("<option>").attr( "value", result[i].Id).text(result[i].LeanMfgApps__Code__c).appendTo("#shiftSelect_Sp");                       
                        };
                    }
                } else if (event.type === 'exception') {
                    document.getElementById("spError").innerHTML = event.message;
                } else {
                    document.getElementById("spError").innerHTML = event.message;
                }
            }, {escape:true});
            
            //QUERY EQUIPMENT LIST AND POPULATE SELECT BOX FOR DT AND QUAL SELECTMENU IN THE LOG FORMS
            LeanMfgApps.OeeController.queryEquipments(selectedWorkCenterId, function(result, event) {
                //alert(event.status+" "+selectedWorkCenter+" "+selectedWorkCenterId);
                if (event.status) {
                    jq("#equipmentSelect_Sp option").remove();
                    jq("#equipmentMinorDtSelect option").remove();
                    jq("#equipmentMajorDtSelect option").remove();
                    jq("#equipmentQltSelect option").remove();
                    var l = jq("#equipmentMinorDtSelect option").length;
                    if(l == 0){
                        jq("<option>").attr( "value", "Prompt").text("--Equipment--").appendTo("#equipmentSelect_Sp");
                        jq("<option>").attr( "value", "Prompt").text("--Equipment--").appendTo("#equipmentMinorDtSelect");
                        jq("<option>").attr( "value", "Prompt").text("--Equipment--").appendTo("#equipmentMajorDtSelect");
                        jq("<option>").attr( "value", "Prompt").text("--Equipment--").appendTo("#equipmentQltSelect");
                        jq("#equipmentSelect_Sp").selectmenu('refresh');
                        for(var i=0; i<result.length; i++){
                            jq("<option>").attr( "value", result[i].Id).text(result[i].LeanMfgApps__Name__c).appendTo("#equipmentSelect_Sp");
                            jq("<option>").attr( "value", result[i].Id).text(result[i].LeanMfgApps__Name__c).appendTo("#equipmentMinorDtSelect");
                            jq("<option>").attr( "value", result[i].Id).text(result[i].LeanMfgApps__Name__c).appendTo("#equipmentMajorDtSelect");
                            jq("<option>").attr( "value", result[i].LeanMfgApps__Name__c).text(result[i].LeanMfgApps__Name__c).appendTo("#equipmentQltSelect"); //use eqp name in the value                       
                        };
                    }
                } else if (event.type === 'exception') {
                    document.getElementById("dtError").innerHTML = event.message;
                    document.getElementById("qualError").innerHTML = event.message;
                    //alert(event.message);
                } else {
                    document.getElementById("dtError").innerHTML = event.message;
                    document.getElementById("qualError").innerHTML = event.message;
                    //alert(event.message);
                }
            }, {escape:true});
            
            
            //QUERY DOWNTIME CODES LIST AND POPULATE SELECTMENU
            LeanMfgApps.OeeController.queryDowntimeCodes(plantName, selectedWorkCenter, function(result, event) {
                //alert(event.status+" "+selectedWorkCenter);
                if (event.status) {
                    jq("#dtReasonOeeFormSelect option").remove();
                    var l = jq("#dtReasonOeeFormSelect option").length;
                    if(l == 0){
                        jq("<option>").attr( "value", "--Downtime Reason--").text("--Downtime Reason--").appendTo("#dtReasonOeeFormSelect");
                        for(var i=0; i<result.length; i++){                             
                            jq("<option>").attr( "value", result[i].LeanMfgApps__Code__c).text(result[i].LeanMfgApps__Code__c).appendTo("#dtReasonOeeFormSelect");
                        };
                    }
                } else if (event.type === 'exception') {
                    document.getElementById("oeeLogPageError").innerHTML = event.message;
                } else {
                    document.getElementById("oeeLogPageError").innerHTML = event.message;
                }
            }, {escape:true});
            
            //QUERY QUALITY CODES LIST AND POPULATE SELECTMENU
            LeanMfgApps.OeeController.queryQualityCodes(plantName, selectedWorkCenter, function(result, event) {
                if (event.status) {
                    jq("#qltReasonOeeFormSelect option").remove();
                    var l = jq("#reasonQltSelect option").length;
                    if(l == 0){
                        jq("<option>").attr( "value", "--Quality Reason--").text("--Quality Reason--").appendTo("#qltReasonOeeFormSelect");
                        for(var i=0; i<result.length; i++){                             
                            jq("<option>").attr( "value", result[i].LeanMfgApps__Code__c).text(result[i].LeanMfgApps__Code__c).appendTo("#qltReasonOeeFormSelect");
                        };
                    }
                } else if (event.type === 'exception') {
                    document.getElementById("oeeLogPageError").innerHTML = event.message;
                } else {
                    document.getElementById("oeeLogPageError").innerHTML = event.message;
                }
            }, {escape:true});
            
        }); //end work center change event
	});  //end newOeeLogPage pagebeforeshow
    
    
    // POPULATE HEADER VALUES
    jq("#equipmentSelect_Sp").change(function(){
        selectedEquipment = jq("#equipmentSelect_Sp option:selected").text();
        selectedEquipmentId= jq("#equipmentSelect_Sp").val();
        jq("#eqpNameTxt").text(selectedEquipment);
    });
    jq("#shiftSelect_Sp").change(function(){
        selectedShift = jq("#shiftSelect_Sp option:selected").text();
        jq("#shiftTxt").text(selectedShift);
    });
    jq("#prdLeadInput").change(function(){
        prdLead = jq("#prdLeadInput").val();  
        jq("#prdLeadTxt").text(prdLead);
    });
    jq("#prdDateInput").change(function(){
        var myDate = new Date(jq("#prdDateInput").val());
        prdDate = sfDateFormat(myDate);
        jq("#prdDateTxt").text(prdDate);
    });
    
	// VALIDATE HEADER PAGE FORM
    var equipIdError;
    jq("#nextBtn").click(function(){
        if(plantName !==""){
            jq("#plantNameTxt").text(plantName);
            jq("#err1").hide();
        } else{
            jq("#err1").show();
        }
        if(selectedWorkCenter !==""){
            jq("#workCenterTxt").text(selectedWorkCenter);
            jq("#err2").hide();
        } else{
            jq("#err2").show();
        }  
        if(selectedShift !=="--Selected Shift--"){
            jq("#err3").hide();
        } else{
            jq("#err3").show();
        }
        if(prdLead !==""){
            jq("#err4").hide();
        } else{
            jq("#err4").show();
        }
        if(prdDate !==""){
            jq("#err5").hide();
        } else{
            jq("#err5").show();
        }
        if(selectedEquipmentId !=="" && selectedEquipment !== "--Equipment--"){
            jq("#err6").hide();
            equipIdError = "noError";
        } else{
            jq("#err6").show();
            equipIdError = "hasError";
        }

        
        if(equipIdError == "noError" && plantName !=="" && selectedWorkCenter !=="" && selectedShift !=="--Selected Shift--" && prdLead !="" && prdDate !==""){
            jq.mobile.changePage( "#oeeLogPage", { transition: "slide"});
            jq("#spError").hide();
            refreshOeeLogTable(selectedWorkCenterId, selectedEquipmentId, prdDate);
        } else{
            jq("#spError").html("Error exists in the item(s) marked in red").css("color","#990033");
        }
    }); //end nextBtn
    
    //DEFAULT OEE TARGET
    jq("#availTarget").text(90.0);
    jq("#perfTarget").text(95.0);
    jq("#qualTarget").text(99.9);
    jq("#oeeTarget").text(85.4);
    
    jq("#editTargetBtn").click(function(){
        console.log("editTargetBtn");
        jq.mobile.changePage( "#oeeTargetPage", { transition: "pop", role: "dialog"});
        var avail=jq("#availTarget").html();
        var perf=jq("#perfTarget").html();
        var qual=jq("#qualTarget").html();
        
        jq("#availTargetInput").val(avail);
        jq("#perfTargetInput").val(perf);
        jq("#qualTargetInput").val(qual);
        
        var oeeCalc = (avail*perf*qual)/10000;
        jq("#oeeTargetCalc").text(oeeCalc.toFixed(1)+"%");
        
        jq("#availTargetInput").change(function(){
            avail = jq("#availTargetInput").val();
            if(avail !== ""){
                console.log("change");
                jq("#errAvail").hide();
                oeeCalc = (avail*perf*qual)/10000;
                jq("#oeeTargetCalc").text(oeeCalc.toFixed(1)+"%");
            } else{
                console.log("null");
                jq("#errAvail").show();
            }
        });
        jq("#perfTargetInput").change(function(){
            perf = jq("#perfTargetInput").val();
            if(perf !== ""){
                console.log("change");
                jq("#errPerf").hide();
                oeeCalc = (avail*perf*qual)/10000;
                jq("#oeeTargetCalc").text(oeeCalc.toFixed(1)+"%");
            } else{
                console.log("null");
                jq("#errPerf").show();
            }
        });
        jq("#qualTargetInput").change(function(){
            qual = jq("#qualTargetInput").val();
            if(qual !== ""){
                console.log("change");
                jq("#errQual").hide();
                oeeCalc = (avail*perf*qual)/10000;
                jq("#oeeTargetCalc").text(oeeCalc.toFixed(1)+"%");
            } else{
                console.log("null");
                jq("#errQual").show();
            }
        });
        
        //SET OEE TARGET
        jq("#saveOeeTargetBtn").click(function(){
            var newAvail = jq("#availTargetInput").val();
            var newPerf = jq("#perfTargetInput").val();
            var newQual = jq("#qualTargetInput").val();
            var newOee = jq("#oeeTargetCalc").text();
            
            jq("#availTarget").text(newAvail);
            jq("#perfTarget").text(newPerf);
            jq("#qualTarget").text(newQual);
            jq("#oeeTarget").text(newOee);

            jq.mobile.changePage( "#oeeLogPage", { transition: "slide" });
            visualManagement();
        }); //end saveOeeTargetBtn
        
        jq("#cancelOeeTargetBtn").click(function(){
            jq.mobile.changePage( "#oeeLogPage", { transition: "slide" });
        }); //end cancelDailyDtTargetBtn
    }); //end editTargetBtn
    

    //CALCULATE OEE
    function oeeCalculation(callback){
        //console.log("oeeCalculation func");
        var runtime = netOperatingTime - totDowntime;

        availability = 100*runtime/netOperatingTime;
        if(runtime==0){availability = 0;}
        if(netOperatingTime==0  && runtime==0){availability = 100}
        jq("#availTxt").text(availability.toFixed(1)+"%");
        
        performance = 100*totActualQty/totTargetQty;
        if(totActualQty==0){performance = 0;}
        if(totTargetQty==0 && totActualQty==0){performance = 100;}
        jq("#perfTxt").text(performance.toFixed(1)+"%");
        
        quality = 100*totGoodQty/totActualQty;
        if( totGoodQty==0){quality = 0;}
        if( totActualQty==0 && totScrapQty==0){quality = 100;}
        jq("#qualTxt").text(quality.toFixed(1)+"%");
        
        oee = availability*performance*quality/10000;
        jq("#oeeTxt").text(oee.toFixed(1)+"%");
        //console.log("oee "+oee+" "+availability+" "+performance+" "+quality);
        
        if (callback && typeof(callback) === "function") {  
            callback();  
        }  
    }
    function visualManagement(){
        //console.log("callback visualManagement");
        var aTar = parseFloat(jq("#availTarget").text());
        if(aTar>=availability){
            jq("#availTxt").removeClass("scorebox").addClass("scoreboxRed");
        } else{
            jq("#availTxt").removeClass("scoreboxRed").addClass("scorebox");
        }
        
        var pTar = parseFloat(jq("#perfTarget").text());
        if(pTar>=performance){
            jq("#perfTxt").removeClass("scorebox").addClass("scoreboxRed");
        } else{
            jq("#perfTxt").removeClass("scoreboxRed").addClass("scorebox");
        }
        
        var qTar = parseFloat(jq("#qualTarget").text());
        if(qTar>=quality){
            jq("#qualTxt").removeClass("scorebox").addClass("scoreboxRed");
        } else{
            jq("#qualTxt").removeClass("scoreboxRed").addClass("scorebox");
        }
        
        var oTar = parseFloat(jq("#oeeTarget").text());
        if(oTar>=oee){
            jq("#oeeTxt").removeClass("scorebox").addClass("scoreboxRed");
        } else{
            jq("#oeeTxt").removeClass("scoreboxRed").addClass("scorebox");
        }
    }
    
    
    
    /* *******************************************************
	* ****************** OEE LOG ************************
	********************************************************* */
    
    
    //SAVE OEE LOG
    jq("#saveOeeFormBtn").click(function(){
        //console.log("saveOeeFormBtn");
        jq("#oeeLogValidationError").empty();
        var logType = jq("#typeOeeformSelect").val();
        var st = jq("#startTimeOeeFormLog").val();
        var et = jq("#endTimeOeeFormLog").val();
        var targetRate = jq("#targetRateOeeFormInput").val();
        var qtyComp = jq("#actualQtyOeeFormInput").val();
        var itemNum = jq("#itemNumOeeFormInput").val();
        var dtReason = jq("#dtReasonOeeFormSelect option:selected").text();
        var downtimeDur = jq("#durOeeFormInput").val();
        var qltReason = jq("#qltReasonOeeFormSelect option:selected").text();
        var scrapQty = jq("#scrapQtyOeeFormInput").val();
        var prdLogComments =jq("#commentsOeeFormTxt").val();  //comments are save in the Downtime__c table
        var isDtcheck = jq("#addDtCheckbox").is(':checked');
        var isQltcheck = jq("#addQltCheckbox").is(':checked');
        
        var reportCategory = "OEE Log";  //This is an OEE Log
        //var dtType = "Minor";  //OEE Log is always Minor dt

        var etMinutes = parseInt(et.substr(0,2),10)*60 + parseInt(et.substr(3,2),10);
        var stMinutes = parseInt(st.substr(0,2),10)*60 + parseInt(st.substr(3,2),10);

        //DAY + 1 CALCULATION
        var operatingDur = 0; 
        if(etMinutes>stMinutes){
            operatingDur = etMinutes - stMinutes;
        } else{
            operatingDur = (1440 + etMinutes) - stMinutes;
        }
        
        //VALIDATE FORM
        var qtyCompError;
        var targetRateError;
        var downtimeDurError;
        var scrapQtyError;
        if(logType === "Operating Time"){
            if(targetRate === "" || targetRate <= 0){
                jq("#errOeeForm4").show();
                targetRateError = "hasError";
            } else{
                jq("#errOeeForm4").hide();
                targetRateError = "noError";
            }
            if(qtyComp === "" || qtyComp < 0){
                jq("#errOeeForm5").show();
                qtyCompError = "hasError";
                console.log("qtyCompError hasError");
            } else{
                jq("#errOeeForm5").hide();
                qtyCompError = "noError";
                console.log("qtyCompError noError");
            }
            if(isDtcheck){
                if(dtReason === "--Downtime Reason--"){
                    jq("#errOeeForm7").show();
                    console.log("errOeeForm7 show dtReason"+dtReason);
                } else{
                    jq("#errOeeForm7").hide();
                    console.log("errOeeForm7 hide dtReason"+dtReason);
                }
                if(downtimeDur === "" || downtimeDur <= 0){
                    jq("#errOeeForm8").show();
                    downtimeDurError = "hasError";
                } else{
                    jq("#errOeeForm8").hide();
                    downtimeDurError = "noError";
                }
            } else{
                dtReason = "Uptime";
                downtimeDur = 0;
                downtimeDurError = "noError";
                jq("#errOeeForm7").hide();
                jq("#errOeeForm8").hide();
                console.log("errOeeForm7 hide else");
            }
            if(isQltcheck){
                if(qltReason === "--Quality Reason--"){
                    jq("#errOeeForm9").show();
                } else{
                    jq("#errOeeForm9").hide();
                }
                if(scrapQty === "" || scrapQty <= 0){
                    jq("#errOeeForm10").show();
                    scrapQtyError = "hasError";
                } else{
                    jq("#errOeeForm10").hide();
                    scrapQtyError = "noError";
                }
            } else{
                qltReason = "Good Quality";
                scrapQty = 0;
                scrapQtyError = "noError";
                jq("#errOeeForm9").hide();
                jq("#errOeeForm10").hide();
                console.log("errOeeForm9 hide else");
            }
        } else{
            dtReason = "Plan Downtime";
            downtimeDur = 0;
            qltReason = "Good Quality";
            scrapQty = 0;
            jq("#errOeeForm4").hide();
            jq("#errOeeForm5").hide();
        }

        if(st ===""){
            jq("#errOeeForm2").show();
        } else{
            jq("#errOeeForm2").hide();
        }
        if(et === ""){
            jq("#errOeeForm3").show();
        } else{
            jq("#errOeeForm3").hide();
        }
        
        //CALCULATE TARGET QTY
        var oeeTargetQty = (operatingDur - downtimeDur) * targetRate;
        //console.log("oeeTargetQty: "+oeeTargetQty);
        
        //OEE VALIDATION
        var err = jq("<div>");
        var quaError;
        var avaError;
        var perErr;
        
        var ava = 100*(operatingDur - downtimeDur)/operatingDur;
        if(operatingDur - downtimeDur ==0){ava = 0;}
        if(operatingDur == 0){ava = 0}
        jq("#availLogCalc").text(ava.toFixed(1));
        
        var per = 100*qtyComp/oeeTargetQty;
        if(qtyComp==0){per = 0;}
        if(oeeTargetQty==0 && qtyComp==0){per = 100;}
        jq("#perfLogCalc").text(per.toFixed(1));
        
        var qua = 100*(qtyComp-scrapQty)/qtyComp;
        if( qtyComp-scrapQty ==0){qua = 0;}
        if( qtyComp ==0 && scrapQty==0){qua = 100;}
        jq("#qualLogCalc").text(qua.toFixed(1));
        
        
        var oeeCalc = ava*per*qua/10000;
        jq("#oeeLogCalc").text(oeeCalc.toFixed(1));
        console.log("oee "+oeeCalc+" "+ava+" "+per+" "+qua);
        
        if(ava<0){
            var err1 = "You were down longer than the operating time.  Please verify the start time, end time and the duration of downtime.";
            jq("<div>").text(err1).appendTo(err);
            avaError = "hasError";
            console.log("hasError");
        } else{
            avaError = "noError";
            console.log("noError");
        }
        
        if(per>100){
            //console.log("per "+per+" oper"+oper);
            if(confirm("Consider increasing your target rate. Performance should not exceed 100%.  Do you want to continue anyway?")){
                perErr = "noError";
                console.log("noError");
            } else{
                perErr = "hasError";
                console.log("hasError");
            }
        } else{
            perErr = "noError";
        }
        
        if(qua<0){
            var err2 = "You scrapped more than what you made.  Please verify the quantity scrapped and quantity completed.";
            jq("<div>").text(err2).appendTo(err);
            quaError = "hasError";
            console.log("hasError");
        } else{
            quaError = "noError";
            console.log("noError");
        }
        
        if(avaError=="hasError" || quaError=="hasError"){
            jq("#oeeLogValidation").slideDown();
            jq("#oeeLogValidationError").show();
            err.appendTo("#oeeLogValidationError");
        } else{
            jq("#oeeLogValidation").hide();
            jq("#oeeLogValidationError").empty().hide();
        }
        
        //console.log("avaError "+avaError+" perErr "+perErr+" quaError "+quaError+" qtyCompError "+qtyCompError+" targetRateError "+targetRateError+" downtimeDurError "+downtimeDurError+" scrapQtyError "+scrapQtyError);

        if(logType === "Operating Time"){
            if(avaError=="noError" && perErr=="noError" && quaError=="noError" && qtyCompError=="noError" && targetRateError=="noError" && downtimeDurError=="noError" && scrapQtyError=="noError" && st !== "" && et !== "" && dtReason!=="--Downtime Reason--" && qltReason!=="--Quality Reason--" && selectedEquipmentId!==""){
                //SAVE PRODUCTION LOG TO SERVER
                //console.log("Save to server");
                insertOeeLogFunc(st, et, stMinutes, etMinutes, operatingDur, downtimeDur, selectedEquipmentId, logType, targetRate, oeeTargetQty, qtyComp, prdLogComments, reportCategory, itemNum, dtReason, qltReason, scrapQty);
            }
        } else{
            if(st !== "" && et !== ""){
                //SAVE PRODUCTION LOG TO SERVER
                //console.log("Save to server");
                insertOeeLogFunc(st, et, stMinutes, etMinutes, operatingDur, downtimeDur, selectedEquipmentId, logType, targetRate, oeeTargetQty, qtyComp, prdLogComments, reportCategory, itemNum, dtReason, qltReason, scrapQty);
            }
        }
    });  //end saveOeeFormBtn
    
    
    //UPDATE OEE LOG
    jq("#updateOeeFormBtn").click(function(){
        jq("#oeeLogValidationError").empty();
        var seletedId = jq("#seletedId").val();
        var logType = jq("#typeOeeformSelect").val();
    	var st = jq("#startTimeOeeFormLog").val();
        var et = jq("#endTimeOeeFormLog").val();
        var targetRate = jq("#targetRateOeeFormInput").val();
        var qtyComp = jq("#actualQtyOeeFormInput").val();
        var itemNum = jq("#itemNumOeeFormInput").val();
        var dtReason = jq("#dtReasonOeeFormSelect").val();
        var downtimeDur = jq("#durOeeFormInput").val();
        var qltReason = jq("#qltReasonOeeFormSelect").val();
        var scrapQty = jq("#scrapQtyOeeFormInput").val();
        var prdLogComments =jq("#commentsOeeFormTxt").val();
        var isDtcheck = jq("#addDtCheckbox").is(':checked');
        var isQltcheck = jq("#addQltCheckbox").is(':checked');
        
        //var reportCategory = "OEE Log";  //This is an OEE Log
        //var dtType = "Minor";  //OEE Log is always Minor dt

        var etMinutes = parseInt(et.substr(0,2),10)*60 + parseInt(et.substr(3,2),10);
        var stMinutes = parseInt(st.substr(0,2),10)*60 + parseInt(st.substr(3,2),10);

        //DAY + 1 CALCULATION
        var operatingDur = 0; 
        if(etMinutes>stMinutes){
            operatingDur = etMinutes - stMinutes;
        } else{
            operatingDur = (1440 + etMinutes) - stMinutes;
        }
        
        
        //VALIDATE FORM
        var qtyCompError;
        var targetRateError;
        var downtimeDurError;
        var scrapQtyError;
        if(logType === "Operating Time"){
            if(targetRate === "" || targetRate <= 0){
                jq("#errOeeForm4").show();
                targetRateError = "hasError";
            } else{
                jq("#errOeeForm4").hide();
                targetRateError = "noError";
            }
            if(qtyComp === "" || qtyComp < 0){
                jq("#errOeeForm5").show();
                qtyCompError = "hasError";
                console.log("qtyCompError hasError");
            } else{
                jq("#errOeeForm5").hide();
                qtyCompError = "noError";
                console.log("qtyCompError noError");
            }
            if(isDtcheck){
                if(dtReason === "--Downtime Reason--"){
                    jq("#errOeeForm7").show();
                    console.log("errOeeForm7 show dtReason"+dtReason);
                } else{
                    jq("#errOeeForm7").hide();
                    console.log("errOeeForm7 hide dtReason"+dtReason);
                }
                if(downtimeDur === "" || downtimeDur <= 0){
                    jq("#errOeeForm8").show();
                    downtimeDurError = "hasError";
                } else{
                    jq("#errOeeForm8").hide();
                    downtimeDurError = "noError";
                }
            } else{
                dtReason = "Uptime";
                downtimeDur = 0;
                downtimeDurError = "noError";
                jq("#errOeeForm7").hide();
                jq("#errOeeForm8").hide();
                console.log("errOeeForm7 hide else");
            }
            if(isQltcheck){
                if(qltReason === "--Quality Reason--"){
                    jq("#errOeeForm9").show();
                } else{
                    jq("#errOeeForm9").hide();
                }
                if(scrapQty === "" || scrapQty <= 0){
                    jq("#errOeeForm10").show();
                    scrapQtyError = "hasError";
                } else{
                    jq("#errOeeForm10").hide();
                    scrapQtyError = "noError";
                }
            } else{
                qltReason = "Good Quality";
                scrapQty = 0;
                scrapQtyError = "noError";
                jq("#errOeeForm9").hide();
                jq("#errOeeForm10").hide();
                console.log("errOeeForm9 hide else");
            }
        } else{
            dtReason = "Plan Downtime";
            downtimeDur = 0;
            qltReason = "Good Quality";
            scrapQty = 0;
            jq("#errOeeForm4").hide();
            jq("#errOeeForm5").hide();
        }

        if(st ===""){
            jq("#errOeeForm2").show();
        } else{
            jq("#errOeeForm2").hide();
        }
        if(et === ""){
            jq("#errOeeForm3").show();
        } else{
            jq("#errOeeForm3").hide();
        }
        
        //CALCULATE TARGET QTY
        var oeeTargetQty = (operatingDur - downtimeDur) * targetRate;
        //console.log("oeeTargetQty: "+oeeTargetQty);
        
        //OEE VALIDATION
        var err = jq("<div>");
        var quaError;
        var avaError;
        var perErr;
        
        var ava = 100*(operatingDur - downtimeDur)/operatingDur;
        if(operatingDur - downtimeDur ==0){ava = 0;}
        if(operatingDur == 0){ava = 0}
        jq("#availLogCalc").text(ava.toFixed(1));
        
        var per = 100*qtyComp/oeeTargetQty;
        if(qtyComp==0){per = 0;}
        if(oeeTargetQty==0 && qtyComp==0){per = 100;}
        jq("#perfLogCalc").text(per.toFixed(1));
        
        var qua = 100*(qtyComp-scrapQty)/qtyComp;
        if( qtyComp-scrapQty ==0){qua = 0;}
        if( qtyComp ==0 && scrapQty==0){qua = 100;}
        jq("#qualLogCalc").text(qua.toFixed(1));
        
        
        var oeeCalc = ava*per*qua/10000;
        jq("#oeeLogCalc").text(oeeCalc.toFixed(1));
        console.log("oee "+oeeCalc+" "+ava+" "+per+" "+qua);
        
        if(ava<0){
            var err1 = "You were down longer than the operating time.  Please verify the start time, end time and the duration of downtime.";
            jq("<div>").text(err1).appendTo(err);
            avaError = "hasError";
            console.log("hasError");
        } else{
            avaError = "noError";
            console.log("noError");
        }
        
        if(per>100){
            //console.log("per "+per+" oper"+oper);
            if(confirm("Consider increasing your target rate. Performance should not exceed 100%.  Do you want to continue anyway?")){
                perErr = "noError";
                console.log("noError");
            } else{
                perErr = "hasError";
                console.log("hasError");
            }
        } else{
            perErr = "noError";
        }
        
        if(qua<0){
            var err2 = "You scrapped more than what you made.  Please verify the quantity scrapped and quantity completed.";
            jq("<div>").text(err2).appendTo(err);
            quaError = "hasError";
            console.log("hasError");
        } else{
            quaError = "noError";
            console.log("noError");
        }
        
        if(avaError=="hasError" || quaError=="hasError"){
            jq("#oeeLogValidation").slideDown();
            jq("#oeeLogValidationError").show();
            err.appendTo("#oeeLogValidationError");
        } else{
            jq("#oeeLogValidation").hide();
            jq("#oeeLogValidationError").empty().hide();
        }
        
        //console.log("avaError "+avaError+" perErr "+perErr+" quaError "+quaError+" qtyCompError "+qtyCompError+" targetRateError "+targetRateError+" downtimeDurError "+downtimeDurError+" scrapQtyError "+scrapQtyError);
        
        if(logType === "Operating Time"){
            if(avaError=="noError" && perErr=="noError" && quaError=="noError" && qtyCompError=="noError" && targetRateError=="noError" && downtimeDurError=="noError" && scrapQtyError=="noError" && st !== "" && et !== "" && dtReason!=="--Downtime Reason--" && qltReason!=="--Quality Reason--" && selectedEquipmentId!==""){
                //SAVE PRODUCTION LOG TO SERVER
                //console.log("Save to server");
                updateOeeLogFunc(st, et, stMinutes, etMinutes, operatingDur, logType, targetRate, oeeTargetQty, qtyComp, prdLogComments, itemNum, dtReason, downtimeDur, qltReason, scrapQty, seletedId);
            }
        } else{
            if(st !== "" && et !== ""){
                //SAVE PRODUCTION LOG TO SERVER
                //console.log("Save to server");
                updateOeeLogFunc(st, et, stMinutes, etMinutes, operatingDur, logType, targetRate, oeeTargetQty, qtyComp, prdLogComments, itemNum, dtReason, downtimeDur, qltReason, scrapQty, seletedId);
            }
        }
    });  //end updateOeeFormBtn
    
    // POPULATE PERF OEE FOR EDITTING  
    jq("#oeePerfLogTbody").on("click", "#editOeePerfBtn", function(){
        //console.log("editOeePerfBtn");
        jq("#oeeLogValidation").hide();
        jq("#oeeLogValidationError").hide();

        //REMOVE ERROR AT FIRST SHOWING
        jq("#oeeFormPage").on( 'pageshow',function(event){
            jq("#saveOeeFormBtn[type='button']").button('disable').button("refresh");
            jq("#updateOeeFormBtn[type='button']").button('enable').button("refresh");
            jq( "#addDtCheckbox" ).prop( "checked", true ).checkboxradio( "refresh" );
            jq( "#addQltCheckbox" ).prop( "checked", true ).checkboxradio( "refresh" );
        });
        jq.mobile.changePage( "#oeeFormPage", { transition: "pop", role: "dialog" });
        var selRow = jq(this).parent().index();
        var selId = jq(this).parent().children().eq(0).text();
        //PERF TABLE
        var typ = jq(this).parent().children().eq(1).text();
        var st = jq(this).parent().children().eq(2).text();
        var et = jq(this).parent().children().eq(3).text();
        var rate = jq(this).parent().children().eq(4).text();
        var tar = jq(this).parent().children().eq(5).text();
        var act = jq(this).parent().children().eq(6).text();
        var itm = jq(this).parent().children().eq(7).text();
        //DT and QLT TABLE
        var dtrea = jq("#oeeDtQltLogTbody").find("td:contains("+selId+")").next().text();
        var dtdur = jq("#oeeDtQltLogTbody").find("td:contains("+selId+")").next().next().text();
        var qltRea = jq("#oeeDtQltLogTbody").find("td:contains("+selId+")").next().next().next().text();
        var qtyScrp = jq("#oeeDtQltLogTbody").find("td:contains("+selId+")").next().next().next().next().text();
        var comments = jq("#oeeDtQltLogTbody").find("td:contains("+selId+")").next().next().next().next().next().text();
        
        if(typ == "Operating Time"){
            jq(".hideshow").show();
            jq("#dtFormGroup").show();
            jq("#qltFormGroup").show();
        } else{
            jq(".hideshow").hide();
            jq("#dtFormGroup").hide();
            jq("#qltFormGroup").hide();
        }
        
        jq("#seletedId").val(selId);
        jq("#typeOeeformSelect").val(typ);
        jq("#typeOeeformSelect").selectmenu('refresh');
        
        jq("#startTimeOeeFormLog").val(st);
        jq("#endTimeOeeFormLog").val(et);
        jq("#targetRateOeeFormInput").val(rate);
        jq("#actualQtyOeeFormInput").val(act);
        jq("#itemNumOeeFormInput").val(itm);
        
        if(dtrea === "Uptime"){
            jq("#dtReasonOeeFormSelect").val("--Downtime Reason--");
            jq("#dtReasonOeeFormSelect").selectmenu('refresh');
        } else{
            jq("#dtReasonOeeFormSelect").val(dtrea);
            jq("#dtReasonOeeFormSelect").selectmenu('refresh');
        }
        jq("#durOeeFormInput").val(dtdur);
        
        if(qltRea === "Good Quality"){
            jq("#qltReasonOeeFormSelect").val("--Quality Reason--");
            jq("#qltReasonOeeFormSelect").selectmenu('refresh');
        } else{
            jq("#qltReasonOeeFormSelect").val(qltRea);
            jq("#qltReasonOeeFormSelect").selectmenu('refresh');
        }
        jq("#scrapQtyOeeFormInput").val(qtyScrp);
        jq("#commentsOeeFormTxt").val(comments);
    });  //end prdLogTbody editPerfBtn
    
    
    // POPULATE OEE LOG FOR EDITTING  
    jq("#oeeDtQltLogTbody").on("click", "#editOeeDtQltBtn", function(){
        //console.log("editOeeDtQltBtn");
        jq("#oeeLogValidation").hide();
        jq("#oeeLogValidationError").hide();

        //REMOVE ERROR AT FIRST SHOWING
        jq("#oeeFormPage").on( 'pageshow',function(event){
            jq("#saveOeeFormBtn[type='button']").button('disable').button("refresh");
            jq("#updateOeeFormBtn[type='button']").button('enable').button("refresh");
            jq( "#addDtCheckbox" ).prop( "checked", true ).checkboxradio( "refresh" );
            jq( "#addQltCheckbox" ).prop( "checked", true ).checkboxradio( "refresh" );
        });
        jq.mobile.changePage( "#oeeFormPage", { transition: "pop", role: "dialog" });
        //DT QLT TABLE
        var selRow = jq(this).parent().index();
        var selId = jq(this).parent().children().eq(0).text();
        var dtrea = jq(this).parent().children().eq(1).text();
        var dtdur = jq(this).parent().children().eq(2).text();
        var qltRea = jq(this).parent().children().eq(3).text();
        var qtyScrp = jq(this).parent().children().eq(4).text();
        var comments = jq(this).parent().children().eq(5).text();
        //PERF TABLE
        var typ = jq("#oeePerfLogTbody").find("td:contains("+selId+")").next().text();
        var st = jq("#oeePerfLogTbody").find("td:contains("+selId+")").next().next().text();
        var et = jq("#oeePerfLogTbody").find("td:contains("+selId+")").next().next().next().text();
        var rate = jq("#oeePerfLogTbody").find("td:contains("+selId+")").next().next().next().next().text();
        var act = jq("#oeePerfLogTbody").find("td:contains("+selId+")").next().next().next().next().next().next().text();
		var itm = jq("#oeePerfLogTbody").find("td:contains("+selId+")").next().next().next().next().next().next().next().text();
        
        if(typ == "Operating Time"){
            jq(".hideshow").show();
            jq("#dtFormGroup").show();
            jq("#qltFormGroup").show();
        } else{
            jq(".hideshow").hide();
            jq("#dtFormGroup").hide();
            jq("#qltFormGroup").hide();
        }
        
        jq("#seletedId").val(selId);
        jq("#typeOeeformSelect").val(typ);
        jq("#typeOeeformSelect").selectmenu('refresh');
        
        jq("#startTimeOeeFormLog").val(st);
        jq("#endTimeOeeFormLog").val(et);
        jq("#targetRateOeeFormInput").val(rate);
        jq("#actualQtyOeeFormInput").val(act);
        jq("#itemNumOeeFormInput").val(itm);
        
        if(dtrea === "Uptime"){
            jq("#dtReasonOeeFormSelect").val("--Downtime Reason--");
            jq("#dtReasonOeeFormSelect").selectmenu('refresh');
        } else{
            jq("#dtReasonOeeFormSelect").val(dtrea);
            jq("#dtReasonOeeFormSelect").selectmenu('refresh');
        }
        jq("#durOeeFormInput").val(dtdur);
        
        if(qltRea === "Good Quality"){
            jq("#qltReasonOeeFormSelect").val("--Quality Reason--");
            jq("#qltReasonOeeFormSelect").selectmenu('refresh');
        } else{
            jq("#qltReasonOeeFormSelect").val(qltRea);
            jq("#qltReasonOeeFormSelect").selectmenu('refresh');
        }
        jq("#scrapQtyOeeFormInput").val(qtyScrp);
        jq("#commentsOeeFormTxt").val(comments);
    });  //end oeeDtQltLogTbody editOeeDtQltBtn
    
    
    
    //ADD A LOG
  	jq("#oeeFormAddALogBtn").click(function(){
         //REMOVE ERROR AT FIRST SHOWING
        jq("#oeeFormPage").on( 'pageshow',function(event){
            jq("#updateOeeFormBtn[type='button']").button('disable').button("refresh");
            jq("#saveOeeFormBtn[type='button']").button('enable').button("refresh");
        });
        jq.mobile.changePage( "#oeeFormPage", { transition: "pop", role: "dialog" });
        clearOeeFormPage();
  	});  //end oeeFormAddALogBtn
    
    //CANCEL PRODUCTION LOG
  	jq("#cancelOeeFormBtn").click(function(){
        jq.mobile.changePage( "#oeeLogPage", { transition: "slide" });
        clearOeeFormPage();
  	});  //end cancelPerfBtn
    
    //OEE LOG TYPE ON CHANGE
    jq("#typeOeeformSelect").change(function(){
        var logType = jq("#typeOeeformSelect").val();
    	if(logType == "Operating Time"){
            jq(".hideshow").slideDown();
            jq("#dtFormGroup").hide();
            jq("#qltFormGroup").hide();
            
            jq( "#addDtCheckbox" ).prop( "checked", false ).checkboxradio( "refresh" );
            jq( "#addQltCheckbox" ).prop( "checked", false ).checkboxradio( "refresh" );
            
            jq("#targetRateOeeFormInput").val("");
            jq("#actualQtyOeeFormInput").val("");
            jq("#dtReasonOeeFormSelect option:selected").text("--Downtime Reason--");
            jq("#dtReasonOeeFormSelect").selectmenu('refresh');
            jq("#durOeeFormInput").val("");
            jq("#qltReasonOeeFormSelect option:selected").text("--Quality Reason--");
            jq("#qltReasonOeeFormSelect").selectmenu('refresh');
            jq("#scrapQtyOeeFormInput").val("");
            jq("#itemNumOeeFormInput").val("");
            
        } else{
            jq(".hideshow").slideUp();
            jq("#dtFormGroup").hide();
            jq("#qltFormGroup").hide();
            jq("#targetRateOeeFormInput").val(0);
            jq("#actualQtyOeeFormInput").val(0);
            jq("#durOeeFormInput").val(0);
            jq("#scrapQtyOeeFormInput").val(0);
            jq("#itemNumOeeFormInput").val("");
       		
            jq("#errOeeForm4").hide();
            jq("#errOeeForm5").hide();
            jq("#errOeeForm7").hide();
            jq("#errOeeForm8").hide();
            jq("#errOeeForm9").hide();
            jq("#errOeeForm10").hide();
        }	
    }); //end typeOeeformSelect
    
    //Hide show Downtime
    jq("#dtFormGroup").hide();
    jq("#addDtCheckbox").change(function(){
        var ischeck = jq("#addDtCheckbox").is(':checked');
        console.log("dt ischeck "+ischeck);
        if(ischeck){
        	jq("#dtFormGroup").slideDown();
            jq("#dtReasonOeeFormSelect option:selected").text("--Downtime Reason--");
            jq("#durOeeFormInput").val("");
            console.log("ischeck");
        } else{
        	jq("#dtFormGroup").slideUp();
            jq("#dtReasonOeeFormSelect").val("Uptime");
            jq("#durOeeFormInput").val(0);
            console.log("is not check");
        }
        jq("#dtReasonOeeFormSelect").selectmenu("refresh");
    }); //end addDtCheckbox
    
    //Hide show Quality
    jq("#qltFormGroup").hide();
    jq("#addQltCheckbox").change(function(){
        var ischeck = jq("#addQltCheckbox").is(':checked');
        //console.log("dt ischeck "+ischeck);
        if(ischeck){
        	jq("#qltFormGroup").slideDown();
            jq("#qltReasonOeeFormSelect option:selected").text("--Quality Reason--");
            jq("#scrapQtyOeeFormInput").val("");
        } else{
        	jq("#qltFormGroup").slideUp();
            jq("#qltReasonOeeFormSelect").val("Good Quality");
            jq("#scrapQtyOeeFormInput").val(0);
        }
        jq("#qltReasonOeeFormSelect").selectmenu("refresh");
    }); //end addDtCheckbox
    
    
    //INSERT OEE LOG
    function insertOeeLogFunc(st, et, stMinutes, etMinutes, operatingDur, downtimeDur, selectedEquipmentId, logType,  targetRate, oeeTargetQty, qtyComp, prdLogComments, reportCategory, itemNum, dtReason, qltyReason, scrapQty){
        jq.mobile.loading( "show");
        LeanMfgApps.OeeController.insertOeeLog(st, et, stMinutes, etMinutes, operatingDur, downtimeDur, selectedEquipmentId, logType,  targetRate, oeeTargetQty, qtyComp, prdLogComments, plantName, selectedWorkCenterId, selectedShift, prdLead, prdDate, reportCategory, itemNum, dtReason, qltyReason, scrapQty, function(result,  event) {
            if (event.status) {
                jq.mobile.loading( "hide");
                refreshOeeLogTable(selectedWorkCenterId, selectedEquipmentId, prdDate);
                jq.mobile.changePage( "#oeeLogPage", { transition: "slide" });
            } else if (event.type === 'exception') {
                document.getElementById("oeeLogPageError").innerHTML = event.message;
            } else {
                document.getElementById("oeeLogPageError").innerHTML = event.message;
            }
        }, {escape:true});  //end insertProductionLog
    };  //end insertProductionLogFunc
    
    //DELETE OEE PERF BTN
    jq("#oeePerfLogTbody").on("click", "#deleteOeePerfBtn", function(){
        if(confirm("Are you sure you want to Delete this log?")){
            var selRow = jq(this).parent().index();
            var selId = jq(this).parent().children().eq(0).text();
            deleteOee(selId);
        } else {
        }
    });  //end  oeePerfLogTbody deleteOeePerfBtn
    
    //DELETE OEE DT QLT BTN
    jq("#oeeDtQltLogTbody").on("click", "#deleteOeeDtQltBtn", function(){
        if(confirm("Are you sure you want to Delete this log?")){
            var selRow = jq(this).parent().index();
            var selId = jq(this).parent().children().eq(0).text();
            deleteOee(selId);
        } else {
        }
    });  //end  oeeDtQltLogTbody deleteOeeDtQltBtn
    
    //DELETE PERFORMANCE LOG
    function deleteOee(selId){
        jq.mobile.loading( "show");
        LeanMfgApps.OeeController.deleteProductionLog(selId, function(result, event) {
            if (event.status) {
                jq.mobile.loading( "hide");
                refreshOeeLogTable(selectedWorkCenterId, selectedEquipmentId, prdDate);
            } else if (event.type === 'exception') {
                document.getElementById("oeeLogPageError").innerHTML = event.message;
            } else {
                document.getElementById("oeeLogPageError").innerHTML = event.message;
            }
        }, {escape:true});  //end deleteProductionLog
    };  //end deletePerformance
    
    //UPDATE OEE LOG
    function updateOeeLogFunc(st, et, stMinutes, etMinutes, operatingDur, logType, targetRate, oeeTargetQty, qtyComp, oeeComments, itemNum, dtReason, downtimeDur, qltReason, qtyScrap, seletedId){
        jq.mobile.loading( "show");
        LeanMfgApps.OeeController.updateOeeLog(st, et, stMinutes, etMinutes, operatingDur, logType, targetRate, oeeTargetQty, qtyComp, oeeComments, itemNum, dtReason, downtimeDur, qltReason, qtyScrap, seletedId, function(result, event) {
            if (event.status) {
                jq.mobile.loading( "hide");
                refreshOeeLogTable(selectedWorkCenterId, selectedEquipmentId, prdDate);
                jq.mobile.changePage( "#oeeLogPage", { transition: "slide" });
            } else if (event.type === 'exception') {
                document.getElementById("oeeLogPageError").innerHTML = event.message;
            } else {
                document.getElementById("oeeLogPageError").innerHTML = event.message;
            }
        }, {escape:true});  //end updateProductionLog
    };  //end updateProductionLogFunc
    
    
    //POPULATE OEE TABLES oeePerfLogTbody AND oeeDtQltLogTbody
    function refreshOeeLogTable(selectedWorkCenterId, selectedEquipmentId, prdDate){
        jq.mobile.loading( "show");
        jq('#oeePerfLogTbody').empty();
        jq('#oeeDtQltLogTbody').empty();
        totActualQty = 0;
        totTargetQty = 0;
        totDowntime =0;
        totGoodQty = 0;
        totScrapQty = 0
        netOperatingTime = 0;
        LeanMfgApps.OeeController.queryOeeLog(selectedWorkCenterId, selectedEquipmentId, prdDate, function(result, event) {
            if (event.status) {
                jq.mobile.loading( "hide");
                for(var i=0; i<result.length; i++){
                    var trow = jq("<tr>");
                    var tdId = result[i].Id;
                    var tdName = result[i].Name;
                    var tdStartTime = result[i].LeanMfgApps__Start_Time__c;
                    var tdStartTimeMinutes = result[i].LeanMfgApps__Start_Time_Minutes__c;
                    var tdEndTime = result[i].LeanMfgApps__End_Time__c;
                    var tdEndTimeMinutes = result[i].LeanMfgApps__End_Time_Minutes__c;
                    var operDuration = result[i].LeanMfgApps__Duration__c;
                    var tdType = result[i].LeanMfgApps__Type__c;
                    var tdActualQty = parseFloat(result[i].LeanMfgApps__Actual_Qty__c);
                    var tdTargetQty = parseFloat(result[i].LeanMfgApps__Target_Qty__c);
                    var tdTargetRate = parseFloat(result[i].LeanMfgApps__Target_Rate__c);
                    var tdReason = result[i].LeanMfgApps__Reason__c;
                    var tdComments = result[i].LeanMfgApps__Comments__c;
                    var tdProductionDate = result[i].LeanMfgApps__Production_Date__c;
                    var tdShift = result[i].LeanMfgApps__Shift__c;
                    var tdWorkCenter = result[i].LeanMfgApps__Work_Center__r.LeanMfgApps__Name__c;
                    var tdItemNum = result[i].LeanMfgApps__Item_Number__c;
                    var dtReason = result[i].LeanMfgApps__Downtime_Reason__c;
                    var dtDuration = result[i].LeanMfgApps__Downtime_Duration__c;
                    var qltyReason = result[i].LeanMfgApps__Quality_Reason__c;
                    var qtyScrap = result[i].LeanMfgApps__Quantity_Scrapped__c;
                    
                    var targetQtyCalc = (operDuration - dtDuration)*tdTargetRate;
                    
                    var perfRow = jq("<tr>");
                    jq("<td class='fontSize'>").text(tdId).appendTo(perfRow).hide();
                    jq("<td class='fontSize'>").text(tdType).appendTo(perfRow);
                    jq("<td class='fontSize'>").text(tdStartTime).appendTo(perfRow);
                    jq("<td class='fontSize'>").text(tdEndTime).appendTo(perfRow);
                    jq("<td class='fontSize'>").text(tdTargetRate).appendTo(perfRow);
                    jq("<td class='fontSize'>").text(targetQtyCalc).appendTo(perfRow);
                    jq("<td class='fontSize'>").text(tdActualQty).appendTo(perfRow);
                    //Undefined  tdItemNum
                    if(tdItemNum === undefined){
                        jq("<td class='fontSize'>").text("").appendTo(perfRow);
                    } else {
                        jq("<td class='fontSize'>").text(tdItemNum).appendTo(perfRow);
                    } 
                    jq("<td class='tdBtn' id='editOeePerfBtn'>").text("Edit").appendTo(perfRow);
                    jq("<td class='tdBtn' id='deleteOeePerfBtn'>").text("Delete").appendTo(perfRow);
                    perfRow.appendTo("#oeePerfLogTbody");
                    
                    var dtQltRow = jq("<tr>");
                    jq("<td class='fontSize'>").text(tdId).appendTo(dtQltRow).hide();
                    jq("<td class='fontSize'>").text(dtReason+"").appendTo(dtQltRow);
                    jq("<td class='fontSize'>").text(dtDuration+"").appendTo(dtQltRow);
                    jq("<td class='fontSize'>").text(qltyReason+"").appendTo(dtQltRow);
                    jq("<td class='fontSize'>").text(qtyScrap+"").appendTo(dtQltRow);
                    //Undefined  tdComments
                    if(tdComments === undefined){
                        jq("<td class='fontSize'>").text("").appendTo(dtQltRow);
                    } else {
                        jq("<td class='fontSize'>").text(tdComments).appendTo(dtQltRow);
                    } 
                    jq("<td class='tdBtn' id='editOeeDtQltBtn'>").text("Edit").appendTo(dtQltRow);
                    jq("<td class='tdBtn' id='deleteOeeDtQltBtn'>").text("Delete").appendTo(dtQltRow);
                    dtQltRow.appendTo("#oeeDtQltLogTbody");
                    
                    //Calculate Net Operating Time
                    if(tdType === "Operating Time"){
                        netOperatingTime = parseFloat(netOperatingTime) + parseFloat(operDuration);
                        totDowntime = parseFloat(totDowntime) + parseFloat(dtDuration);
                        totTargetQty = parseFloat(totTargetQty) + parseFloat(targetQtyCalc);
                        totActualQty = parseFloat(totActualQty) + parseFloat(tdActualQty);
                        totGoodQty = parseFloat(totGoodQty) + (parseFloat(tdActualQty)-parseFloat(qtyScrap));
                        totScrapQty = parseFloat(totScrapQty) + parseFloat(qtyScrap);
                        console.log("totGoodQty "+totGoodQty+" tdActualQty "+tdActualQty+" qtyScrap "+qtyScrap)
                    }
                    jq("#notTxt").text(netOperatingTime);
                    jq("#dtTxt").text(totDowntime);
                    jq("#targetQtyTxt").text(totTargetQty);
                    jq("#actualQtyTxt").text(totActualQty);
                    jq("#goodQltTxt").text(totGoodQty);
                    jq("#qtyScrpTxt").text(totScrapQty);
                }
                //Calculate OEE
                oeeCalculation(function(){
                    visualManagement();
                });
            } else if (event.type === 'exception') {
                document.getElementById("oeeLogPageError").innerHTML = event.message;
            } else {
                document.getElementById("oeeLogPageError").innerHTML = event.message;
            } 
        }, {escape:true});  //end queryProductionLogs
    };  //end refreshOeePerformanceLogTable
    
    function clearOeeFormPage(){
        jq(".hideshow").show();
        jq("#dtFormGroup").hide();
        jq("#qltFormGroup").hide();
        jq("#oeeLogValidation").hide();
        jq("#oeeLogValidationError").hide();
        
        //REMOVE ERROR AT FIRST SHOWING
        jq("#oeeFormPage").on( 'pageshow',function(event){
            jq("#addDtCheckbox").prop( "checked", false ).checkboxradio( "refresh" );
            jq("#addQltCheckbox").prop( "checked", false ).checkboxradio( "refresh" );
        });
        
        jq("#typeOeeformSelect").val("Operating Time");  //Changed value from Run Time to Operating Time
        jq("#startTimeOeeFormLog").val("");
        jq("#endTimeOeeFormLog").val("");
        jq("#targetRateOeeFormInput").val("");
        jq("#actualQtyOeeFormInput").val("");
        jq("#itemNumOeeFormInput").val("");
        jq("#commentsOeeFormTxt").val("");
        jq("#dtReasonOeeFormSelect").val('--Downtime Reason--');
        jq("#durOeeFormInput").val("");
        jq("#qltReasonOeeFormSelect").val('--Quality Reason--');
        jq("#scrapQtyOeeFormInput").val("");
        
        //REMOVE ERROR AT FIRST SHOWING
        jq("#oeeFormPage").on( 'pageshow',function(event){
            jq("#typeOeeformSelect").selectmenu('refresh');
            jq("#dtReasonOeeFormSelect").selectmenu('refresh');
            jq("#qltReasonOeeFormSelect").selectmenu('refresh');
        });
    }  //end clearOeeFormPage
    
    //SF DATE FORMAT MM/DD/YYYY
    function sfDateFormat(dateString){
        var myDate = new Date(dateString);
        var YYYY = myDate.getUTCFullYear();
        var MM = myDate.getUTCMonth()+1;
        var DD = myDate.getUTCDate();
        
        if(MM>=10){
            MM = MM;
        } else{
            MM = "0"+MM;
        }
        if(DD>=10){
            DD = DD;
        } else{
            DD = "0"+DD;
        }
        //console.log(MM);
        var formatedDate = MM+"/"+DD+"/"+YYYY;
        return formatedDate;
    }
    
    //DATE FORMAT YYYY-MM-DD
    function dateFormat(dateString){
        var myDate = new Date(dateString);
        var YYYY = myDate.getUTCFullYear();
        var MM = myDate.getUTCMonth()+1;
        var DD = myDate.getUTCDate();
        
        if(MM>=10){
            MM = MM;
        } else{
            MM = "0"+MM;
        }
        if(DD>=10){
            DD = DD;
        } else{
            DD = "0"+DD;
        }
        console.log(MM);
        var formatedDate = YYYY+"-"+MM+"-"+DD;
        return formatedDate;
    };
    
    //DURATION IN DAYS CALCULATION
    function durationInDays(startDate, endDate){
        var sDate = new Date(startDate);
        var eDate = new Date(endDate);
        
        if(sDate>eDate){
            alert("Start Date cannot be later than End Date");
        } else{
            var milliseconds = eDate-sDate;
            var durInDays = milliseconds/(24*60*60*1000);
        }
        return durInDays;
    };
    
    //VALIDATE DATES
    function validateDates(startDate, endDate){
        var sDate = new Date(startDate);
        var eDate = new Date(endDate);
        var validDates;
        if(sDate>=eDate){
            alert("End Date must be later than Start Date.");
            validDates = "false";
        } else{
            validDate = "true";
        }
        return validDate;
    };
});  //end doc ready