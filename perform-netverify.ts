import https from 'https';

const API_TOKEN: string = process.env.API_TOKEN;
const API_SECRET: string = process.env.API_SECRET;

interface ReqData {
  merchantIdScanReference: string;
  frontsideImage: string;
  faceImage: string;
  country: string;
  idType: string;
}

function validateRequest(data: ReqData) {
  if (!data) {
    throw new Error('request body is empty');
  }
  if (!data.merchantIdScanReference) {
    throw new Error('merchantIdScanReference is required');
  }
  if (!data.frontsideImage) {
    throw new Error('frontsideImage is required');
  }
  if (!data.faceImage) {
    throw new Error('faceImage is required');
  }
  if (!data.country) {
    throw new Error('country is required');
  }
  if (!data.idType) {
    throw new Error('idType is required');
  }

  return null;
}

export default function(data: ReqData) {
  return new Promise((resolve, reject) => {
    try {
      validateRequest(data);
    } catch (error) {
      resolve({
        status: 'error',
        code: 400,
        message: error.message
      });
      return;
    }

    const merchantIdScanReference = data.merchantIdScanReference;
    const frontsideImage = data.frontsideImage;
    const faceImage = data.faceImage;
    const country = data.country;
    const idType = data.idType;

    const body = {
      merchantIdScanReference,
      frontsideImage,
      faceImage,
      country,
      idType
    };

    const bodyStr = JSON.stringify(body);

    const authorization = Buffer.from(`${API_TOKEN}:${API_SECRET}`).toString('base64');
    const options = {
      hostname: 'netverify.com',
      path: '/api/netverify/v2/performNetverify',
      port: 443,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        'Authorization': `Basic ${authorization}`
      }
    };
    https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const response = JSON.parse(data);
        if (response.httpStatus !== 200) {
          resolve({
            status: 'error',
            code: response.httpStatus,
            message: response.message
          });
        } else {
          resolve({
            status: 'success',
            data: response.data
          });
        }
      })
    }).on('error', error => {
      resolve({
        status: 'error',
        code: 400,
        message: error.message
      });
    }).end(bodyStr);
  });
}