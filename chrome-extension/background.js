let color = '#3aa757'
let serverURL = 'https://calime.herokuapp.com';

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ color: color }, function () {
        console.log('Default background color set to %cgreen', `color: ${color}`);
    });

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { urlMatches: '.*' },
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

function generateCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

function getQueryVariable(url, variable) {
    var query = url.substring(url.indexOf("?") + 1)
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");

        if (request.action == "authenticate") {
            const redirectURL = chrome.identity.getRedirectURL();
            const clientID = "44b4d59d26f3de14475f72e2f4fe32ee";
            // generate code for MAL to authenticate
            code_challenge = generateCode(128);
            let authURL = "https://myanimelist.net/v1/oauth2/authorize";
            authURL += `?response_type=code`
            authURL += `&client_id=${clientID}`;
            authURL += `&code_challenge=${code_challenge}`;
            authURL += `&redirect_uri=${encodeURIComponent(redirectURL)}`;
            authURL += `&state=state`;

            console.log(authURL)
            console.log('REDIRECT', redirectURL)

            // open popup for MAL auth
            chrome.identity.launchWebAuthFlow({
                interactive: true,
                url: authURL
            }, url => {
                // user authenticated
                if (url) {
                    console.log("Authenticating user", url);
                    // parse the auth code
                    let authorization_code = getQueryVariable(url, 'code');
    
                    let data = {
                        "client_id": clientID,
                        "code": authorization_code,
                        "code_verifier": code_challenge,
                        "grant_type": "authorization_code",
                        "redirect_uri": redirectURL
                    }
    
                    // use auth code to trade in for an access token
                    fetch(`${serverURL}/getToken`, {
                        method: 'POST',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data) // body data type must match "Content-Type" header
                    })
                        .then(res => res.json())
                        .then(json => sendResponse(json));
                }
                // user cancelled
                else {
                    sendResponse(undefined);
                }                
            })

            return true;
        }
    }
);