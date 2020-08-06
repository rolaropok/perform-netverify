import * as https from 'https';
import {
  ErrorType,
  hasValidImageSize,
  hasValidContentLength,
  isValidImageMimeType,
  isValidCountryCode,
  isValidAlpha3Code,
  isValidState,
  isValidDate
} from './utils';

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

enum Parameters {
  merchantIdScanReference = 'merchantIdScanReference',
  frontsideImage = 'frontsideImage',
  faceImage = 'faceImage',
  country = 'country',
  idType = 'idType',
  frontsideImageMimeType = 'frontsideImageMimeType',
  faceImageMimeType = 'faceImageMimeType',
  backsideImage = 'backsideImage',
  backsideImageMimeType = 'backsideImageMimeType',
  enabledFields = 'enabledFields',
  merchantReportingCriteria = 'merchantReportingCriteria',
  customerId = 'customerId',
  callbackUrl = 'callbackUrl',
  firstName = 'firstName',
  lastName = 'lastName',
  usState = 'usState',
  expiry = 'expiry',
  number = 'number',
  dob = 'dob',
  callbackGranularity = 'callbackGranularity',
  personalNumber = 'personalNumber'
};

interface Credential {
  apiToken: string;
  apiSecret: string;
  region: Region;
  userAgent: string;
}

interface RequestData {
  merchantIdScanReference: string;
  frontsideImage: string;
  faceImage?: string | Buffer;
  country: string;
  idType: IDType;
  frontsideImageMimeType?: string;
  faceImageMimeType?: string;
  backsideImage?: string | Buffer;
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

  private handleError(error: ErrorType, param?: Parameters, data?: any) {
    switch (error) {
      case ErrorType.MISSING_API_TOKEN:
        throw new Error('API Token is missing');
      case ErrorType.MISSING_API_SECRET:
        throw new Error('API Secret is missing');
      case ErrorType.MISSING_USER_AGENT:
        throw new Error('User Agent is missing');
      case ErrorType.EMPTY_CONTENT:
        throw new Error(`${param} is required for this request`);
      case ErrorType.INVALID_CONTENT_LENGTH:
        throw new Error(`${param}'s length should be less than ${data}`);
      case ErrorType.INVALID_IMAGE_SIZE:
        throw new Error(`${param}'s size should be less than 15MB`);
      case ErrorType.INVALID_IMAGE_DIMENSION:
        throw new Error(`${param}'s dimension should be less than 8000px`);
      case ErrorType.INVALID_COUNTRY_CODE:
        throw new Error(`${data} is not valid country code`);
      case ErrorType.INVALID_ID_TYPE:
        throw new Error(`${param} is invalid ID type`);
      case ErrorType.INVALID_MIME_TYPE:
        throw new Error(`${param} should be one of image/jpeg and image/png`);
      case ErrorType.INVALID_ENABLE_FIELD:
        throw new Error(`${param} has invalid field - ${data}`);
      case ErrorType.INVALID_STATE_CODE:
        throw new Error(`${data} is invalid state code`);
      case ErrorType.INVALID_DATE_FORMAT:
        throw new Error(`${param} should has YYYY-MM-DD format`);
      case ErrorType.INVALID_DATE:
        throw new Error(`${param} is invalid date`);
      case ErrorType.INVALID_CALLBACK_GRANULARITY:
        throw new Error(`${param} has invalid callback granularity`);
      default:
        break;
    }
  }

  private checkMerchantIdScanReference(data: RequestData) {
    if (!data.merchantIdScanReference) {
      this.handleError(ErrorType.EMPTY_CONTENT, Parameters.merchantIdScanReference);
    }
    if (!hasValidContentLength(data.merchantIdScanReference, 100)) {
      this.handleError(ErrorType.INVALID_CONTENT_LENGTH, Parameters.merchantIdScanReference, 100);
    }
  }

  private checkFrontsideImage(data: RequestData) {
    if (!data.frontsideImage) {
      this.handleError(ErrorType.EMPTY_CONTENT, Parameters.frontsideImage);
    }
    const error = hasValidImageSize(data.frontsideImage);
    this.handleError(error, Parameters.frontsideImage);
  }

  private checkFaceImage(data: RequestData) {
    if (data.enabledFields && data.enabledFields?.indexOf(EnabledFields.idFaceMatch) > -1 && !data.faceImage) {
      this.handleError(ErrorType.EMPTY_CONTENT, Parameters.faceImage);
    }
    if (data.faceImage) {
      const error = hasValidImageSize(data.faceImage);
      this.handleError(error, Parameters.faceImage);
    }
  }

  private checkCountry(data: RequestData) {
    if (!data.country) {
      this.handleError(ErrorType.EMPTY_CONTENT, Parameters.country);
    }
    if (!isValidAlpha3Code(data.country)) {
      this.handleError(ErrorType.INVALID_COUNTRY_CODE, Parameters.country, data.country);
    }
  }

  private checkIdType(data: RequestData) {
    if (!data.idType) {
      this.handleError(ErrorType.EMPTY_CONTENT, Parameters.idType);
    }
    if (data.idType !== IDType.DRIVING_LICENSE && 
      data.idType !== IDType.ID_CARD &&
      data.idType !== IDType.PASSPORT &&
      data.idType !== IDType.VISA
      ) {
        this.handleError(ErrorType.INVALID_ID_TYPE, Parameters.idType);
      }
  }

  private checkFrontsideImageMimeType(data: RequestData) {
    if (data.frontsideImageMimeType && !isValidImageMimeType(data.frontsideImageMimeType)) {
      this.handleError(ErrorType.INVALID_MIME_TYPE, Parameters.frontsideImageMimeType);
    }
  }

  private checkFaceImageMimeType(data: RequestData) {
    if (data.faceImageMimeType && !isValidImageMimeType(data.faceImageMimeType)) {
      this.handleError(ErrorType.INVALID_MIME_TYPE, Parameters.faceImageMimeType);
    }
  }

  private checkBacksideImage(data: RequestData) {
    if (data.backsideImage) {
      const error = hasValidImageSize(data.backsideImage);
      this.handleError(error, Parameters.backsideImage);
    }
  }

  private checkBacksideImageMimeType(data: RequestData) {
    if (data.backsideImageMimeType && !isValidImageMimeType(data.backsideImageMimeType)) {
      this.handleError(ErrorType.INVALID_MIME_TYPE, Parameters.backsideImageMimeType);
    }
  }

  private checkEnabledFields(data: RequestData) {
    if (data.enabledFields) {
      if (!hasValidContentLength(data.enabledFields, 100)) {
        this.handleError(ErrorType.INVALID_CONTENT_LENGTH, Parameters.enabledFields, 100);
      } else {
        const values = Object.values(EnabledFields);
        const fields = data.enabledFields.replace(/ /g,'').split(',');
        for (let index = 0; index < fields.length; index += 1) {
          var invalid = true;
          for (let ind = 0; ind < values.length; ind += 1) {
            if (values[ind] === fields[index]) {
              invalid = false;
              break;
            }
          }
  
          if (invalid) {
            this.handleError(ErrorType.INVALID_ENABLE_FIELD, Parameters.enabledFields, fields[index]);
          }
        }
      }
    }
  }

  private checkMerchantReportingCriteria(data: RequestData) {
    if (data.merchantReportingCriteria && !hasValidContentLength(data.merchantReportingCriteria, 100)) {
      this.handleError(ErrorType.INVALID_CONTENT_LENGTH, Parameters.merchantReportingCriteria, 100);
    }
  }

  private checkCustomerId(data: RequestData) {
    if (data.customerId && !hasValidContentLength(data.customerId, 100)) {
      this.handleError(ErrorType.INVALID_CONTENT_LENGTH, Parameters.customerId, 100);
    }
  }

  private checkCallbackUrl(data: RequestData) {
    if (data.callbackUrl && !hasValidContentLength(data.callbackUrl, 255)) {
      this.handleError(ErrorType.INVALID_CONTENT_LENGTH, Parameters.callbackUrl, 255);
    }
  }

  private checkFirstName(data: RequestData) {
    if (data.firstName && !hasValidContentLength(data.firstName, 100)) {
      this.handleError(ErrorType.INVALID_CONTENT_LENGTH, Parameters.firstName, 100);
    }
  }

  private checkLastName(data: RequestData) {
    if (data.lastName && !hasValidContentLength(data.lastName, 100)) {
      this.handleError(ErrorType.INVALID_CONTENT_LENGTH, Parameters.lastName, 100);
    }
  }

  private checkUsState(data: RequestData) {
    if (data.usState) {
      if (data.idType === IDType.PASSPORT || data.idType === IDType.ID_CARD) {
        if (!isValidCountryCode(data.usState)) {
          this.handleError(ErrorType.INVALID_STATE_CODE, Parameters.usState, data.usState);
        }
      } else if (data.idType === IDType.DRIVING_LICENSE) {
        if (!isValidState(data.usState)) {
          this.handleError(ErrorType.INVALID_STATE_CODE, Parameters.usState, data.usState);
        }
      }
    }
  }

  private checkExpiry(data: RequestData) {
    if (data.expiry) {
      const error = isValidDate(data.expiry);
      this.handleError(error, Parameters.expiry);
    }
  }

  private checkNumber(data: RequestData) {
    if (data.number && !hasValidContentLength(data.number, 100)) {
      this.handleError(ErrorType.INVALID_CONTENT_LENGTH, Parameters.number, 100);
    }
  }

  private checkDob(data: RequestData) {
    if (data.dob) {
      const error = isValidDate(data.dob);
      this.handleError(error, Parameters.dob);
    }
  }

  private checkCallbackGranularity(data: RequestData) {
    if (data.callbackGranularity && data.callbackGranularity !== 'onFinish' && data.callbackGranularity !== 'onAllSteps') {
      this.handleError(ErrorType.INVALID_CALLBACK_GRANULARITY, Parameters.callbackGranularity);
    }
  }

  private checkPersonalNumber(data: RequestData) {
    if (data.personalNumber && !hasValidContentLength(data.personalNumber, 14)) {
      this.handleError(ErrorType.INVALID_CONTENT_LENGTH, Parameters.personalNumber, 14);
    }
  }

  private validateRequest(data: RequestData) {
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

  private validateCredential() {
    if (this.apiToken === '') {
      this.handleError(ErrorType.MISSING_API_TOKEN);
    }

    if (this.apiSecret === '') {
      this.handleError(ErrorType.MISSING_API_SECRET);
    }

    if (this.userAgent === '') {
      this.handleError(ErrorType.MISSING_USER_AGENT);
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
