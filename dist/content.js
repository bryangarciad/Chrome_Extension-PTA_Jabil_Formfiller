console.log("Chrome Extension ready to go!");

chrome.runtime.onMessage.addListener(replace);
//Replace
function replace(message, sender, sendresponse) {
    //use axxios request to update DOM
    //use ptaData to fill the proper inputs
    //return response
    console.log(message);
    sendresponse('yeaaaaaaah boy')
}