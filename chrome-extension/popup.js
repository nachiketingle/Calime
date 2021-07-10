let changeColor = document.getElementById("changeColor");
let baseUrl = "https://api.myanimelist.net/v2/";
let fields = ["start_date", "end_date", "broadcast", "num_episodes", "status"];
let authToken = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjYxMWZlMWI0ZGExZmM0NTMzOWY1NWEzYjkxNDY1NTMzODY5NGUyNjY0NjhjM2IzN2ExODY3NTZmYzc0MDA1MmRhMzFhODcyMjkxNWRkZmMxIn0.eyJhdWQiOiI0NGI0ZDU5ZDI2ZjNkZTE0NDc1ZjcyZTJmNGZlMzJlZSIsImp0aSI6IjYxMWZlMWI0ZGExZmM0NTMzOWY1NWEzYjkxNDY1NTMzODY5NGUyNjY0NjhjM2IzN2ExODY3NTZmYzc0MDA1MmRhMzFhODcyMjkxNWRkZmMxIiwiaWF0IjoxNjI1ODU1MTE0LCJuYmYiOjE2MjU4NTUxMTQsImV4cCI6MTYyODUzMzUxNCwic3ViIjoiMTMyNTY5MTciLCJzY29wZXMiOltdfQ.gj_X2waSBbiiuDYTQBXNgE8AFSAt6pTKgZJWnNdvRtMFGfdLeLBswnXPCyIUnxBfRrasR-W_vDQiK13oHhme3kyzRQp0x4akmUQBIEjuQttFGptjbcxFkU7Eqm_vbU5sNL1RpQ8Li2Y_t0OToIozlWAe5RMtQ2Rooh2EPnWRoUBkWveBXz6NXjsbhfD01qygDPOoSzo49i6oF9-AplBgsV4iwzTQZgXgGWX7E5rQc8FtwuwisqHHrecr6anKwS719H34DBbSU3vXg2OZMPVHGWDoIEs13aTdQ_2T0A1v0400P2t8U5Pi49TqrgqTEejO4Xk8zIjOMBtZMtUlfVJpKw";

chrome.storage.sync.get("color", function(data)  {
    changeColor.style.backgroundColor = data.color;
    changeColor.setAttribute('value', data.color);
});

changeColor.onclick = function(element) {
    let color = element.target.value;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(
            tabs[0].id,
            {code: 'document.body.style.backgroundColor = "' + color + '";'});
    });

    chrome.runtime.sendMessage({ action: "authenticate" }, function (response) {
        console.log(response);
    });

    // getUserList('NachoLife', authToken);
};

async function getUserList(username, authToken) {
    // Create the url
    var url = baseUrl + "users/" + username + "/animelist";

    //Add fields
    url += "?fields=";
    for(f in fields) {
        url += fields[f];
        if(fields[f] != fields[fields.length - 1])
            url += ",";
    }

    //url = "https://cors-anywhere.herokuapp.com/" + url;
    
    var res = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
        }
    });

    let text = await res.text()
    console.log(text)

    // var blob = new Blob(await res.json(), {type: "text/plain"});
    // var dwnld = URL.createObjectURL(blob);
    // chrome.downloads.download({
    //     url: dwnld
    // });
}