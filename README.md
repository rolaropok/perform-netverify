# perform-netverify

This repo contains `performNetverify` client library and testing node app.

Main client library is **`perform-netverify.ts`**.


```
npm install
npm run start
```

Here is how you can use `perform-netverify.ts` in your project.
Please copy this file to your src directory and import the library like below.

```ts

import { Region, IDType, NetverifyClient } from './perform-netverify';

const client = new NetverifyClient().initialize({
  apiToken: 'token',
  apiSecret: 'secret',
  region: Region.US,
  userAgent: 'agent'
});

client.performNetverify({
  merchantIdScanReference: 'xxxx',
  frontsideImage: 'base64',
  faceImage: 'base64',
  country: 'country',
  idType: IDType.ID_CARD
}).then(resp => {
  console.log(resp);
}).catch(error => {
  console.log(error);
});


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
