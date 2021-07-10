let color = '#3aa757'

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ color: color }, function() {
        console.log('Default background color set to %cgreen', `color: ${color}`);
    });

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {hostEquals: 'developer.chrome.com'},
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});
