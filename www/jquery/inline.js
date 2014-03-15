var jq=jQuery.noConflict();
var selKey="";

function init(){
	//alert("init");
    console.log("init inline js");
    
    //navigator.notification.alert(message, alertCallback, [title], [buttonName]);
    
    navigator.notification.alert(
                                 'You are the winner!',  // message
                                 alertDismissed,         // callback
                                 'Game Over',            // title
                                 'Done'                  // buttonName
                                 );
    
	//heijunka.listAlSchedulelKeys();
	
} //end init



jq("#takeapicBtn").click(function(){
                         //alert("Take a PIc BTN Clicked");
                         
                         navigator.notification.alert(
                                                      'Take a Pic BTN Clicked!',  // message
                                                      alertDismissed,         // callback
                                                      'Take a Pic',            // title
                                                      'OK'                  // buttonName
                                                      );

                         });

function alertDismissed() {
    // do something
}
