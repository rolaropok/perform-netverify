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
