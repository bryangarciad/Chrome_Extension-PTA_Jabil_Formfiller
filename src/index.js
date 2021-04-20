import axios from "axios";

// init the content js
chrome.tabs.executeScript({file: 'content.js'});

// grab the items from DOM
const fileInput = document.getElementById("PTA_CSV")

// Global required vars
let PtaObjectArr = [];
const doubleTagRegex = /<td>|<\/td>/g;
let axiosData = 'testText'

/******************** */
// row click listiner
/******************** */
const rowClicked = (i) => {
    //axios request

    
    //send message to background with the info; background worker will hanlde the target DOM
    if (confirm(`You're about to send PTA: ${PtaObjectArr[i].pta_id}`)) {

        let cleanObject = Object.assign({}, PtaObjectArr[i]);

        Object.keys(cleanObject).forEach( k => {
            cleanObject[k] = k !== 'sent' ? cleanObject[k].replaceAll(doubleTagRegex, '') : cleanObject[k];
        })

        axios.get('http://mxchim0web03/pta_chi/Importation/Importation.ASP', {
            params: {
                ID: cleanObject.pta_id
            }
        })
        .then( (res) => {
            axiosData = res
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id, {csvData: cleanObject, axiosData: axiosData}, function(response) {alert(response)});
            });
            PtaObjectArr[i].sent = true;
            //update local html table and storage with the new data
            localStorage.setItem('ptaObjectData', JSON.stringify(PtaObjectArr))
            ArrToHtmlTableBody(PtaObjectArr, false)
        })
        .catch( (e) => {
            axiosData = e
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id, {csvData: cleanObject, axiosData: axiosData}, function(response) {alert(response)});
            });
        })
      } else {
      } 
}

/*********************************************** */
//add listener for click event to each row in table
/********************************************** */
const addListenerToRows = () => {
    let rows = document.getElementsByClassName('ptaRow');
    for(let i = 0; i < rows.length; i++ ) {
        rows[i].addEventListener('click', function(){rowClicked(i)}, false)
    }
}

/******************************************* */
// Transform Array Object into HTML table Body
/***************************************** */
const ArrToHtmlTableBody = (data, fromLoad) => {
    let tableBody = ''
    let newData = []
    if(fromLoad){
        newData = data.map( item => {
            Object.keys(item).forEach(k => {
                if(k !== 'sent') {
                    item[k] = `<td>${item[k]}</td>`
                } else {
                    item[k] = item[k]
                }
                
            })
            return item;
        })
    }
    else{
        newData = data
    }
    newData.forEach(item => {
        if(item.sent) {
            tableBody += `<tr class="red ptaRow"> ${item.pta_id.replace(/\s/g, '')}${item.peso_bruto}${item.imp_guia}${item.no_guia}${item.no_factura}${item.pedimento}${item.date}${item.impo_expo}</tr>`
        } else {
            tableBody += `<tr class="white ptaRow"> ${item.pta_id.replace(/\s/g, '')}${item.peso_bruto}${item.imp_guia}${item.no_guia}${item.no_factura}${item.pedimento}${item.date}${item.impo_expo}</tr>`
        }
    })
    
    document.getElementById('tbody').innerHTML = tableBody
    addListenerToRows();
}

/********************************* */
//check if data is already stores
/******************************** */
if (localStorage.getItem('ptaObjectData')) {
    try {
        PtaObjectArr = JSON.parse(localStorage.getItem('ptaObjectData'))
        ArrToHtmlTableBody(PtaObjectArr, false);
    } catch(e) {
        alert(e); // error in the above strings
        localStorage.removeItem('ptaObjectData')
    }
    // document.getElementById('tbody').innerHTML = localStorage.getItem('ptaTableData')
    // addListenerToRows();
}

/*********************** */
//File reader with FR
/********************** */
const readFile = function () {
    var reader = new FileReader();
    reader.onload = function () {
        //Scoped Vars
        let DataString = reader.result
        let tableBodyArr = []
        PtaObjectArr = [];

        // response String to Arr
        let ptaArr = DataString.split(',');

        // Remove first 8 element; header items
        ptaArr.splice(0, 8)

        // prepare each item individually for HTML adding TD tag
        ptaArr = ptaArr.map( (item, count) => {
            let cleanItem = item.indexOf('CI') !== -1 ? item.slice(item.indexOf('CI'), item.length) : item.replaceAll(' ', '');
            // return `<td>${cleanItem}</td>`
            return cleanItem;
        })

        // Splice Array into groups of 8 (row of 8 items)
        while(ptaArr.length) tableBodyArr.push(ptaArr.splice(0,8));

        // Joining every item into a single string
        tableBodyArr.map( (item, count) => {
            // const doubleTagRegex = /<td>|<\/td>/g;
            PtaObjectArr.push({
                'pta_id': item[0], 
                'peso_bruto': item[1],
                'imp_guia': item[2],
                'no_guia': item[3],
                'no_factura': item[4],
                'pedimento': item[5],
                'date': item[6],
                'impo_expo': item[7],
                'sent': false
            })

            // return `<tr class="ptaRow" id="${count}"> ${item.join('')} </tr>`
        })

        //Save Local Storage table data and object data to keep the app state
        // localStorage.setItem('ptaTableData', TBody.reduce((acc, currentValue) => acc + currentValue))
        localStorage.setItem('ptaObjectData', JSON.stringify(PtaObjectArr))
        // Array to String with reducer acction
        // document.getElementById('tbody').innerHTML = TBody.reduce((acc, currentValue) => acc + currentValue)
    };
    reader.onloadend = () => {
        ArrToHtmlTableBody(PtaObjectArr, true);

        // addListenerToRows();
    }
    // start reading the file. When it is done, calls the onload event defined above.
    reader.readAsBinaryString(fileInput.files[0]);
};

fileInput.addEventListener('change', readFile);