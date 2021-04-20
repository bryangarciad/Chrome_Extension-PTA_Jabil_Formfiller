console.log("Chrome Extension ready to go!");

chrome.runtime.onMessage.addListener(replace);
//Replace
function replace(message, sender, sendresponse) {
    //_middlefram2
    //use axxios request to update DOM
    //use ptaData to fill the proper inputs
    //return response
    const target = document.querySelector('[name="_middleframe2"]')
    target.innerHTML = ''
    target.innerHTML = message.axiosData.data
    //fill the rest of the data with the message csv

    console.log(message);
    sendresponse('yeaaaaaaah boy')
}