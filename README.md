# perform-netverify

This repo contains `performNetverify` client library and implementation guide is here - [implementation-guide](https://github.com/Jumio/implementation-guides/blob/master/netverify/performNetverify.md)

npm version is available for this and you can find this here - [perform-netverify](https://www.npmjs.com/package/perform-netverify)

- You can install it by **npm i perform-netverify**
- If you need to install locally, please make sure you have all files (index.ts, countries.json, states.json, utils.ts). Also please add [image-size](https://github.com/image-size/image-size) package as dependency.

```ts

import { Region, IDType, NetverifyClient } from 'perform-netverify';

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
