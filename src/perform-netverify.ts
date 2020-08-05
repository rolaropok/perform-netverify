import * as https from 'https';

export enum Region {
  US = 'US', EU = 'EU', SGP = 'SGP'
}

export enum IDType {
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  ID_CARD = 'ID_CARD',
  VISA = 'VISA'
}

interface Credential {
  apiToken: string;
  apiSecret: string;
  region: Region;
  userAgent: string;
}

interface RequestData {
  merchantIdScanReference: string;
  frontsideImage: string;
  faceImage: string;
  country: string;
  idType: IDType;
  frontsideImageMimeType?: string;
  faceImageMimeType?: string;
  backsideImage?: string;
  backsideImageMimeType?: string;
  enabledFields?: string;
  merchantReportingCriteria?: string;
  customerId?: string;
  callbackUrl?: string;
  firstName?: string;
  lastName?: string;
  usState?: string;
  expiry?: string;
  number?: string;
  dob?: string;
  callbackGranularity?: string;
  personalNumber?: string;
}

const hostnames = {
  US: 'netverify.com',
  EU: 'lon.netverify.com',
  SGP: 'core-sgp.jumio.com'
};

export class NetverifyClient {

  apiToken: string = '';
  apiSecret: string = '';
  region: Region = Region.US;
  userAgent: string = '';

  constructor() {}

  public initialize(credential: Credential): NetverifyClient {
    this.apiToken = credential.apiToken;
    this.apiSecret = credential.apiSecret;
    this.region = credential.region;
    this.userAgent = credential.userAgent;
    return this;
  }

  validateRequest(data: RequestData) {
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
  }

  validateCredential() {
    if (this.apiToken === '') {
      throw new Error('apiToken is required. Please initialize the client with credentials');
    }

    if (this.apiSecret === '') {
      throw new Error('apiSecret is required. Please initialize the client with credentials');
    }

    if (this.userAgent === '') {
      throw new Error('userAgent is required. Please initialize the client with credentials');
    }
  }

  public performNetverify(reqData: RequestData) {
    return new Promise((resolve, reject) => {
      try {
        this.validateCredential();
      } catch (error) {
        reject({
          status: 'error',
          code: 403,
          message: error.message
        });
        return;
      }

      try {
        this.validateRequest(reqData);
      } catch (error) {
        reject({
          status: 'error',
          code: 400,
          message: error.message
        });
        return;
      }

      const bodyStr = JSON.stringify(reqData);
      const authorization = Buffer.from(`${this.apiToken}:${this.apiSecret}`).toString('base64');
      const hostname = hostnames[this.region]

      const options = {
        hostname,
        path: '/api/netverify/v2/performNetverify',
        port: 443,
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
          'Authorization': `Basic ${authorization}`,
          'User-Agent': this.userAgent
        }
      };
      https.request(options, res => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
          const response = JSON.parse(data);
          if (response.httpStatus !== 200) {
            reject({
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
        reject({
          status: 'error',
          code: 400,
          message: error.message
        });
      }).end(bodyStr);
    });
  }
}
