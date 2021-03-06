var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');
var cors = require('cors');

router.use(cors());

let fields = ["start_date", "end_date", "broadcast", "num_episodes", "status"];

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/getToken', async function (req, res) {
  const tokenURL = "https://myanimelist.net/v1/oauth2/token";

  console.log(req.body);
  // use auth code to trade in for an access token
  let s = new URLSearchParams(Object.entries(req.body)).toString();
  console.log(s)
  fetch(tokenURL, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: s // body data type must match "Content-Type" header
  })
    .then(r => r.json())
    .then(json => {
      console.log(JSON.stringify(json));
      res.json(json)
    });
})

// Use express generator to run
router.get('/malUserList', async function(req, res, next) {
  let token = req.query.token;
  let status = req.query.status;
  let name = await getUserName(token);
  res.json(await malRequest(name, status, token));
});

// Use express generator to run
router.get('/malUserNextList', async function(req, res, next) {
  let url = req.query.url;
  let token = req.query.token;

  //Add fields
  url += "&fields=";
  for (f in fields) {
    url += fields[f];
    if (fields[f] != fields[fields.length - 1])
      url += ",";
  }
  console.log("URL at endpoint: " + url);
  var userReq = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    }
  });
  res.json(await userReq.json());
});

router.get('/getUserName', async function(req, res, next) {
  let token = req.query.token;
  res.send(await getUserName(token));
});

async function getUserName(token) {
  let url = "https://api.myanimelist.net/v2/users/@me";
  var userReq = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    }
  });

  try {
    let json = await userReq.json();
    return json.name;
  } catch(e) {
    console.error(e);
    let text = await userReq.text();
    console.log(text);
  }
}

async function malRequest(name, status, auth) {
  let baseUrl = "https://api.myanimelist.net/v2/";
  let authToken = auth ? auth : "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjYxMWZlMWI0ZGExZmM0NTMzOWY1NWEzYjkxNDY1NTMzODY5NGUyNjY0NjhjM2IzN2ExODY3NTZmYzc0MDA1MmRhMzFhODcyMjkxNWRkZmMxIn0.eyJhdWQiOiI0NGI0ZDU5ZDI2ZjNkZTE0NDc1ZjcyZTJmNGZlMzJlZSIsImp0aSI6IjYxMWZlMWI0ZGExZmM0NTMzOWY1NWEzYjkxNDY1NTMzODY5NGUyNjY0NjhjM2IzN2ExODY3NTZmYzc0MDA1MmRhMzFhODcyMjkxNWRkZmMxIiwiaWF0IjoxNjI1ODU1MTE0LCJuYmYiOjE2MjU4NTUxMTQsImV4cCI6MTYyODUzMzUxNCwic3ViIjoiMTMyNTY5MTciLCJzY29wZXMiOltdfQ.gj_X2waSBbiiuDYTQBXNgE8AFSAt6pTKgZJWnNdvRtMFGfdLeLBswnXPCyIUnxBfRrasR-W_vDQiK13oHhme3kyzRQp0x4akmUQBIEjuQttFGptjbcxFkU7Eqm_vbU5sNL1RpQ8Li2Y_t0OToIozlWAe5RMtQ2Rooh2EPnWRoUBkWveBXz6NXjsbhfD01qygDPOoSzo49i6oF9-AplBgsV4iwzTQZgXgGWX7E5rQc8FtwuwisqHHrecr6anKwS719H34DBbSU3vXg2OZMPVHGWDoIEs13aTdQ_2T0A1v0400P2t8U5Pi49TqrgqTEejO4Xk8zIjOMBtZMtUlfVJpKw";
  let username = name ? name : "NachoLife";
  // Create the url
  var url = baseUrl + "users/" + username + "/animelist";

  //Add fields
  url += "?fields=";
  for (f in fields) {
    url += fields[f];
    if (fields[f] != fields[fields.length - 1])
      url += ",";
  }

  url += "&status=" + status;
  
  console.log("GET: " + url);
  var malRes = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken
    }
  });

  let json = await malRes.json();
  return json;
}

module.exports = router;
