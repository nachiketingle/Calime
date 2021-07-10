let changeColor = document.getElementById("changeColor");
let baseUrl = "https://api.myanimelist.net/v2/";
let fields = ["start_date", "end_date", "broadcast", "num_episodes", "status"];
let serverURL = "http://localhost:3000";

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

    getToken().then(token => console.log(token));

    // getUserList(getToken());
};

function getToken() {
    return new Promise(async resolve => {
        // try to get a token 
        chrome.storage.sync.get("token", function (data) {
            if (data) {
                console.log("Using existing token");
                let token = data.token["access_token"];
                await fetch(`${serverURL}/`)
                resolve();
            }
            else {
                console.log("Requesting new token");
                chrome.runtime.sendMessage({ action: "authenticate" }, function (token) {
                    chrome.storage.sync.set({ token: token }, function () {
                        console.log('Token Set', token);
                        resolve(data.token["access_token"]);
                    });
                });
            }
        });
    })
}

async function getUserList(authToken) {
    let res = await fetch(`${serverURL}/malUserList`);
    let json = await res.json();
    let data = json.data;

    var builder = ["Subject,Start Date", '\n'];
    for (i in data) {
        var row = generateRows(data[i].node);
        if (row)
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
    if (node.title && node.start_date && (node.num_episodes || node.end_date)) {
        console.log("Made it!");
        var date = new Date(node.start_date);
        for (let ep = 0; ep < node.num_episodes; ep++) {
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