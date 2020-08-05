# perform-netverify

This repo contains `performNetverify` client library and testing node app.

Main client library is **`perform-netverify.js`**.

Here is how you can test the project for both node and vue.
Please note that I use node 10.15.3 for this project. client library is not related node version, but Vue front-end might have issue with node version.

```
npm install
npm run start-server (This will run node server)
npm run start (This will run Vue front-end)
```

Here is how you can use `perform-netverify.js` in your project.
Please copy this file to your src directory and import the library like below.

```js
const performNetverify = require('PATH/perform-netverify')

performNetverify({
  merchantIdScanReference: 'xxxx',
  frontsideImage: 'base64 string',
  faceImage: 'base64 string',
  country: 'ISO 3166-1 alpha-3 code',
  idType: 'one of PASSPORT, DRIVING_LICENSE, ID_CARD, VISA'
}).then(resp => {
  if (resp.status === 'success') {
    res.send(resp.data)
  } else {
    res.status(resp.code).send(resp.message)
  }
}).catch(error => {
  res.status(503).send('Service is unavailable')
})
```

Response and Error Handling

###### Successful Response
```
{
  status: 'success',
  data: {netverify json data}
}
```

###### Error Response
```
{
  status: 'error',
  code: errorCode,
  message: errorMessage
}
```
