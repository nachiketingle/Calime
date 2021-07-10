let changeColor = document.getElementById("changeColor");
let baseUrl = "https://api.myanimelist.net/v2/";
let fields = ["start_date", "end_date", "broadcast", "num_episodes", "status"];
let authToken = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjYxMWZlMWI0ZGExZmM0NTMzOWY1NWEzYjkxNDY1NTMzODY5NGUyNjY0NjhjM2IzN2ExODY3NTZmYzc0MDA1MmRhMzFhODcyMjkxNWRkZmMxIn0.eyJhdWQiOiI0NGI0ZDU5ZDI2ZjNkZTE0NDc1ZjcyZTJmNGZlMzJlZSIsImp0aSI6IjYxMWZlMWI0ZGExZmM0NTMzOWY1NWEzYjkxNDY1NTMzODY5NGUyNjY0NjhjM2IzN2ExODY3NTZmYzc0MDA1MmRhMzFhODcyMjkxNWRkZmMxIiwiaWF0IjoxNjI1ODU1MTE0LCJuYmYiOjE2MjU4NTUxMTQsImV4cCI6MTYyODUzMzUxNCwic3ViIjoiMTMyNTY5MTciLCJzY29wZXMiOltdfQ.gj_X2waSBbiiuDYTQBXNgE8AFSAt6pTKgZJWnNdvRtMFGfdLeLBswnXPCyIUnxBfRrasR-W_vDQiK13oHhme3kyzRQp0x4akmUQBIEjuQttFGptjbcxFkU7Eqm_vbU5sNL1RpQ8Li2Y_t0OToIozlWAe5RMtQ2Rooh2EPnWRoUBkWveBXz6NXjsbhfD01qygDPOoSzo49i6oF9-AplBgsV4iwzTQZgXgGWX7E5rQc8FtwuwisqHHrecr6anKwS719H34DBbSU3vXg2OZMPVHGWDoIEs13aTdQ_2T0A1v0400P2t8U5Pi49TqrgqTEejO4Xk8zIjOMBtZMtUlfVJpKw";

chrome.storage.sync.get("color", function (data) {
    changeColor.style.backgroundColor = data.color;
    changeColor.setAttribute('value', data.color);
});

changeColor.onclick = function (element) {
    let color = element.target.value;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.executeScript(
            tabs[0].id,
            { code: 'document.body.style.backgroundColor = "' + color + '";' });
    });

    chrome.runtime.sendMessage({ action: "authenticate" }, function (token) {
        chrome.storage.sync.set({ token: token }, function () {
            console.log('Token Set', token);
        });
    });

    // getUserList('NachoLife', authToken);
};

async function getUserList(username, authToken) {
    let res = await fetch('http://localhost:3000/hi');
    let json = await res.json();
    let data = json.data;
    
    var builder = ["Subject,Start Date", '\n'];
    for(i in data) {
        var row = generateRows(data[i].node);
        if(row)
            builder = builder.concat(row);
    }
    console.log(builder.join());
    var blob = new Blob(builder, { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    chrome.downloads.download({
        url: url,
        filename: "test.csv"
    });
}

function generateRows(node) {
    var builder = [];
    if(node.title && node.start_date && (node.num_episodes || node.end_date)) {
        console.log("Made it!");
        var date = new Date(node.start_date);
        for(let ep = 0; ep < node.num_episodes; ep++) {
            row = generateRow(node.title, date);
            console.log(row.join());
            builder = builder.concat(row);
            date.setDate(date.getDate() + 7);
        }
        console.log(builder.join());
        return builder;
    }
    return null;
}

function generateRow(title, start) {
    return [title + "," + getFormattedDate(start) + "\n"];
}

function getFormattedDate(date) {
    var year = date.getFullYear();
  
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
  
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    
    return month + '/' + day + '/' + year;
}