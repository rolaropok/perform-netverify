const express = require("express");
const bodyParser = require("body-parser");
// const axios = require('axios').default;
const performNetverify = require('./perform-netverify');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

//serve the content straight from the distribution folder (output after npm run build)
app.use(express.static("dist"));

//serve out the api
app.post('/upload', (req, res, next) => {

  performNetverify();

  const frontsideImage = req.body.frontsideImage;
  const faceImage = req.body.faceImage;
  const country = req.body.country;
  const idType = req.body.idType;
  const merchantIdScanReference = 'abc';

  performNetverify({
    merchantIdScanReference,
    frontsideImage,
    faceImage,
    country,
    idType
  }).then(resp => {
    console.log('response - ', resp)
    if (resp.status === 'success') {
      res.send(resp.data)
    } else {
      res.status(resp.code).send(resp.message)
    }
  }).catch(error => {
    console.log('error - ', error)
    res.status(503).send('Service is unavailable')
  })

  // axios.request({
  //   url: 'https://netverify.com/api/netverify/v2/performNetverify',
  //   method: 'post',
  //   headers: {
  //     'Accept': 'application/json',
  //     'Content-Type': 'application/json',
  //     'User-Agent': 'jumio sample app'
  //   },
  //   auth: {
  //     username: process.env.API_TOKEN,
  //     password: process.env.API_SECRET
  //   },
  //   data: {
  //     frontsideImage,
  //     faceImage,
  //     country,
  //     idType
  //   }
  // }).then(response => {
  //   console.log('response - ', response.data);
  //   res.send(response.data);
  // }).catch(error => {
  //   if (error.response) {
  //     res.status(error.response.status).send(error.response.data.message);
  //     return;
  //   }
  //   res.status(503).send('Service is not available');
  // })
});

app.listen(3000);
