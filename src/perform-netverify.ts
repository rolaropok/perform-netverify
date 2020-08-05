import * as https from 'https';
var imageSize = require('image-size');

export enum Region {
  US = 'US', EU = 'EU', SGP = 'SGP'
}

export enum IDType {
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  ID_CARD = 'ID_CARD',
  VISA = 'VISA'
}

export enum EnabledFields {
  idNumber = 'idNumber',
  idFirstName = 'idFirstName',
  idLastName = 'idLastName',
  idDob = 'idDob',
  idExpiry = 'idExpiry',
  idUsState = 'idUsState',
  idPersonalNumber = 'idPersonalNumber',
  idFaceMatch = 'idFaceMatch',
  idAddress = 'idAddress'
}

enum ImageType {
  JPG = 'image/jpeg',
  PNG = 'image/png'
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
  faceImage?: string;
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

  checkImage(img: string, key: string) {
    const buffer = Buffer.from(img.substring(img.indexOf(',') + 1));
    if (buffer.length > 15 * 1024 * 1024) {
      throw new Error(`${key} size should be less than 15 MB`);
    } else {
      // try {
      //   const dimension = imageSize(new Buffer(img));
      //   console.log('dimension - ', dimension.width, dimension.height);
      // } catch (error) {
      //   throw error;
      // }
    }
  }

  checkContentLength(data: string, maxLength: number, key: string) {
    if (data.length > maxLength) {
      throw new Error(`${key}'s length should be less than ${maxLength}`);
    }
  }

  checkMerchantIdScanReference(data: RequestData) {
    if (!data.merchantIdScanReference) {
      throw new Error('merchantIdScanReference is required');
    }
    this.checkContentLength(data.merchantIdScanReference, 100, 'merchantIdScanReference')
  }

  checkFrontsideImage(data: RequestData) {
    if (!data.frontsideImage) {
      throw new Error('frontsideImage is required');
    }
    this.checkImage(data.frontsideImage, 'frontsideImage');
  }

  checkFaceImage(data: RequestData) {
    if (data.enabledFields && data.enabledFields?.indexOf(EnabledFields.idFaceMatch) > -1 && !data.faceImage) {
      throw new Error('faceImage is required');
    }
    this.checkImage(data.faceImage!, 'faceImage');
  }

  checkCountry(data: RequestData) {
    if (!data.country) {
      throw new Error('country code is required');
    }
    this.checkContentLength(data.country, 3, 'country');
  }

  checkIdType(data: RequestData) {
    if (!data.idType) {
      throw new Error('idType is required');
    }
    if (data.idType !== IDType.DRIVING_LICENSE && 
      data.idType !== IDType.ID_CARD &&
      data.idType !== IDType.PASSPORT &&
      data.idType !== IDType.VISA
      ) {
        throw new Error('Invalid Id Type');
      }
  }

  checkImageMimeType(type: string, key: string) {
    if (type !== ImageType.JPG && type !== ImageType.PNG) {
      throw new Error(`${key} should be one of image/jpeg or image/png`);
    }
  }

  checkFrontsideImageMimeType(data: RequestData) {
    if (data.frontsideImageMimeType) {
      this.checkImageMimeType(data.frontsideImageMimeType, 'frontsideImageMimeType')
    }
  }

  checkFaceImageMimeType(data: RequestData) {
    if (data.faceImageMimeType) {
      this.checkImageMimeType(data.faceImageMimeType, 'faceImageMimeType');
    }
  }

  checkBacksideImage(data: RequestData) {
    if (data.backsideImage) {
      this.checkImage(data.backsideImage, 'backsideImage');
    }
  }

  checkBacksideImageMimeType(data: RequestData) {
    if (data.backsideImageMimeType) {
      this.checkImageMimeType(data.backsideImageMimeType, 'backsideImageMimeType');
    }
  }

  checkEnabledFields(data: RequestData) {
    if (data.enabledFields) {
      this.checkContentLength(data.enabledFields, 100, 'enabledFields');
      const values = Object.values(EnabledFields);
      const fields = data.enabledFields.split(',');
      for (let index = 0; index < fields.length; index += 1) {
        var invalid = true;
        for (let ind = 0; ind < values.length; ind += 1) {
          if (values[ind] === fields[index]) {
            invalid = false;
            break;
          }
        }

        if (invalid) {
          throw new Error('enabledFields has invalid string');
        }
      }
    }
  }

  checkMerchantReportingCriteria(data: RequestData) {
    if (data.merchantReportingCriteria) {
      this.checkContentLength(data.merchantReportingCriteria, 100, 'merchantReportingCriteria');
    }
  }

  checkCustomerId(data: RequestData) {
    if (data.customerId) {
      this.checkContentLength(data.customerId, 100, 'customerId');
    }
  }

  checkCallbackUrl(data: RequestData) {
    if (data.callbackUrl) {
      this.checkContentLength(data.callbackUrl, 255, 'callbackUrl');
    }
  }

  checkFirstName(data: RequestData) {
    if (data.firstName) {
      this.checkContentLength(data.firstName, 100, 'firstName');
    }
  }

  checkLastName(data: RequestData) {
    if (data.lastName) {
      this.checkContentLength(data.lastName, 100, 'lastName');
    }
  }

  checkUsState(data: RequestData) {

  }

  isValidDate(dateString: string) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    var d = new Date(dateString);
    var dNum = d.getTime();
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0,10) === dateString;
  }

  checkExpiry(data: RequestData) {
    if (data.expiry && this.isValidDate(data.expiry)) {
      throw new Error('expiry is invalid date');
    }
  }

  checkNumber(data: RequestData) {
    if (data.number) {
      this.checkContentLength(data.number, 100, 'number');
    }
  }

  checkDob(data: RequestData) {
    if (data.dob && this.isValidDate(data.dob)) {
      throw new Error('dob is invalid date');
    }
  }

  checkCallbackGranularity(data: RequestData) {
    if (data.callbackGranularity && data.callbackGranularity !== 'onFinish' && data.callbackGranularity !== 'onAllSteps') {
      throw new Error('Invalid callbackGranularity');
    }
  }

  checkPersonalNumber(data: RequestData) {
    if (data.personalNumber) {
      this.checkContentLength(data.personalNumber, 14, 'personalNumber');
    }
  }

  validateRequest(data: RequestData) {
    this.checkMerchantIdScanReference(data);
    this.checkFrontsideImage(data);
    this.checkFaceImage(data);
    this.checkCountry(data);
    this.checkIdType(data);
    this.checkFrontsideImageMimeType(data);
    this.checkFaceImageMimeType(data);
    this.checkBacksideImage(data);
    this.checkBacksideImageMimeType(data);
    this.checkEnabledFields(data);
    this.checkMerchantReportingCriteria(data);
    this.checkCustomerId(data);
    this.checkCallbackUrl(data);
    this.checkFirstName(data);
    this.checkLastName(data);
    this.checkUsState(data);
    this.checkExpiry(data);
    this.checkNumber(data);
    this.checkDob(data);
    this.checkCallbackGranularity(data);
    this.checkPersonalNumber(data);
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
