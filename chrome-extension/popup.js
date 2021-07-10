let changeColor = document.getElementById("changeColor");
let baseUrl = "https://api.myanimelist.net/v2/";
let fields = ["start_date", "end_date", "broadcast", "num_episodes", "status"];
let serverURL = "https://calime.herokuapp.com";

changeColor.onclick = function (element) {
    getToken().then(token => getUserList("Bearer " + token));
};

function getToken() {
    return new Promise(async resolve => {
        // try to get a token 
        chrome.storage.sync.get("token", function (data) {
            // if token cached
            if (data) {
                console.log("Using existing token");
                let token = data.token["access_token"];
                // get the username to check if token works
                fetch(`${serverURL}/getUserName?token=Bearer ${token}`)
                    .then(res => res.text())
                    .then(username => {
                        // if username exists, token works
                        if (username) {
                            // now need to check if correct username
                            let usrConfirm = confirm(`Continue as ${username}?`);
                            if (usrConfirm) {
                                resolve(token);
                            }
                            else {
                                requestNewToken().then(token => resolve(token));
                            }
                        }
                        // if invalid, need to refresh token
                        else {
                            console.log("Token expired");
                            requestNewToken().then(token => resolve(token));
                        }
                    })
                resolve(token);
            }
            // no token cached, new user
            else {
                requestNewToken().then(token => resolve(token));
            }
        });
    })
}

async function requestNewToken() {
    return new Promise((resolve, reject) => {
        console.log("Requesting new token");
        chrome.runtime.sendMessage({ action: "authenticate" }, function (token) {
            if (token) {
                chrome.storage.sync.set({ token: token }, function () {
                    console.log('Token Set', token);
                    resolve(data.token["access_token"]);
                });
            }            
            else {
                reject('Cannot obtain token');
            }
        });
    })
}

async function getUserList(authToken) {
    var builder = ["Subject,Start Date,Start Time", '\n'];
    
    builder = builder.concat(await buildForStatus(authToken, "watching"));
    builder = builder.concat(await buildForStatus(authToken, "plan_to_watch"));

    console.log(builder.join());
    var blob = new Blob(builder, { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    chrome.downloads.download({
        url: url,
        filename: `calime_${(new Date()).getTime()}.csv`
    });
}

async function buildForStatus(authToken, status) {
    let res = await fetch(`${serverURL}/malUserList?token=` + authToken + "&status=" + status);
    let json = await res.json();
    let data = json.data;
    var builder = [];
    for (i in data) {
        var row = generateRows(data[i].node);
        if (row)
            builder = builder.concat(row);
    }
    return builder;
}

function generateRows(node) {
    var builder = [];
    if (node.title && node.start_date && node.num_episodes) {

        // Get date/time of airing
        var date = new Date(node.start_date);
        let timeString = node.broadcast.start_time;
        let times = timeString.split(':');
        date.setHours(times[0], times[1]);
        date.setHours(date.getHours() - 16);
        for (let ep = 0; ep < node.num_episodes; ep++) {
            row = generateRow(node.title, date);
            builder = builder.concat(row);
            date.setDate(date.getDate() + 7);
        }
        return builder;
    }
    return null;
}

function generateRow(title, date) {
    return [title + "," + getFormattedDate(date) + "," + date.toLocaleTimeString() + "\n"];
}

function getFormattedDate(date) {
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return month + '/' + day + '/' + year;
}