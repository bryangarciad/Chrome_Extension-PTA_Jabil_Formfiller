console.log("Chrome Extension ready to go!");

chrome.runtime.onMessage.addListener(replace);
//Replace
function replace(message, sender, sendresponse) {
    //_middlefram2
    //use axxios request to update DOM
    //use ptaData to fill the proper inputs
    //return response
    const target = document.querySelector('[name="_middleframe2"]').contentDocument.getElementsByTagName('html')[0]
    target.innerHTML = ''
    target.innerHTML = message.axiosData.data
    //fill the rest of the data with the message csv
    const weight = document.querySelector('[name="_middleframe2"]').contentDocument.getElementById('txtRealWeight')
    const no_guia = document.querySelector('[name="_middleframe2"]').contentDocument.getElementById('txtRealAirWayBill') 
    const invoice = document.querySelector('[name="_middleframe2"]').contentDocument.getElementById('txtInvoice') 
    const date = document.querySelector('[name="_middleframe2"]').contentDocument.getElementById('txtCustomsEntryDate') 
    const Freight = document.querySelector('[name="_middleframe2"]').contentDocument.getElementById('txtRealFreight') 

    weight.value = message.csvData.peso_bruto;
    no_guia.value = message.csvData.no_guia;
    invoice.value = message.csvData.no_factura
    Freight.value = message.csvData.imp_guia
    date.value = message.csvData.date
    console.log(message);
    sendresponse('yeaaaaaaah boy') 
}