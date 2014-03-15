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
                         
                         /*navigator.notification.alert(
                                                      'Take a Pic BTN Clicked!',  // message
                                                      alertDismissed,         // callback
                                                      'Take a Pic',            // title
                                                      'OK'                  // buttonName
                                                      );*/
                         
                         navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
                                                     destinationType: Camera.DestinationType.FILE_URI
                                                     });
                         });

function onSuccess(imageURI) {
    var image = document.getElementById('myImage');
    image.src = imageURI;
}

function onFail(message) {
    //alert('Failed because: ' + message);
    navigator.notification.alert(
                                 message,               // message
                                 alertDismissed,        // callback
                                 'Ooops!',          // title
                                 'OK'                   // buttonName
                                 );
}

function alertDismissed() {
    // do something
}
