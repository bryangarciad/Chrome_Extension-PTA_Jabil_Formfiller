import axios from "axios";

// init the content js
chrome.tabs.executeScript({file: 'content.js'});

// grab the items from DOM
const fileInput = document.getElementById("PTA_CSV")

// Global required vars
let PtaObjectArr = [];

// row click listiner
const rowClicked = (i) => {
    //axios request
    //send message to background with the info; background worker will hanlde the target DOM
    if (confirm(`You're about to send PTA: ${PtaObjectArr[i].pta_id} data`)) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {csvData: PtaObjectArr[i], axiosData: 'undefined'}, function(response) {});  
        });
      } else {
      } 
}

//add listener for click event to each row in table
const addListenerToRows = () => {
    let rows = document.getElementsByClassName('ptaRow');
    for(let i = 0; i < rows.length; i++ ) {
        rows[i].addEventListener('click', function(){rowClicked(i)}, false)
    }
}

//check if data is already stores
if (localStorage.getItem('ptaTableData') && localStorage.getItem('ptaObjectData')) {
    try {
        PtaObjectArr = JSON.parse(localStorage.getItem('ptaObjectData'))

    } catch(e) {
        alert(e); // error in the above strings
        localStorage.removeItem('ptaObjectData')
    }
    document.getElementById('tbody').innerHTML = localStorage.getItem('ptaTableData')
    addListenerToRows();
}

// Transform Array Object into HTML table Body
const ArrToHtmlTableBody = (data) => {
    
}

//File reader with FR
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
            return `<td>${cleanItem}</td>`
        })

        // Splice Array into groups of 8 (row of 8 items)
        while(ptaArr.length) tableBodyArr.push(ptaArr.splice(0,8));

        // Joining every item into a single string
        let TBody = tableBodyArr.map( (item, count) => {
            const doubleTagRegex = /<td>|<\/td>/g;

            PtaObjectArr.push({
                'pta_id': item[0] ? item[0].replaceAll(doubleTagRegex, '') : '',  
                'peso_bruto': item[1] ? item[1].replaceAll(doubleTagRegex, '') : '',
                'imp_guia': item[2] ? item[2].replaceAll(doubleTagRegex, '') : '',
                'no_guia': item[3] ? item[3].replaceAll(doubleTagRegex, '') : '',
                'no_factura': item[4] ? item[4].replaceAll(doubleTagRegex, '') : '',
                'pedimento': item[5] ? item[5].replaceAll(doubleTagRegex, '') : '',
                'date': item[6] ? item[6].replaceAll(doubleTagRegex, '') : '',
                'impo_expo': item[7] ? item[7].replaceAll(doubleTagRegex, '') : ''
            })

            return `<tr class="ptaRow" id="${count}"> ${item.join('')} </tr>`
        })

        //Save Local Storage table data and object data to keep the app state
        localStorage.setItem('ptaTableData', TBody.reduce((acc, currentValue) => acc + currentValue))
        localStorage.setItem('ptaObjectData', JSON.stringify(PtaObjectArr))
        // Array to String with reducer acction
        document.getElementById('tbody').innerHTML = TBody.reduce((acc, currentValue) => acc + currentValue)
    };
    reader.onloadend = () => {
        addListenerToRows();
    }
    // start reading the file. When it is done, calls the onload event defined above.
    reader.readAsBinaryString(fileInput.files[0]);
};

fileInput.addEventListener('change', readFile);