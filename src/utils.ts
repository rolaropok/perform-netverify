import { default as countries } from './countries.json';
import { default as states } from './states.json';
var sizeOf = require('image-size');

enum ImageType {
  JPG = 'image/jpeg',
  PNG = 'image/png'
};



export enum ErrorType {
  NONE,
  MISSING_API_TOKEN,
  MISSING_API_SECRET,
  MISSING_USER_AGENT,
  EMPTY_CONTENT,
  INVALID_CONTENT_LENGTH,
  INVALID_IMAGE_SIZE,
  INVALID_IMAGE_DIMENSION,
  INVALID_COUNTRY_CODE,
  INVALID_ID_TYPE,
  INVALID_MIME_TYPE,
  INVALID_ENABLE_FIELD,
  INVALID_STATE_CODE,
  INVALID_DATE_FORMAT,
  INVALID_DATE,
  INVALID_CALLBACK_GRANULARITY
};

export function hasValidImageSize(img: string) {
  const buffer = Buffer.from(img.substring(img.indexOf(',') + 1), 'base64');
  if (buffer.length / 4 * 3 > 15 * 1024 * 1024) {
    return ErrorType.INVALID_IMAGE_SIZE;
  } else {
    try {
      const dim = sizeOf(buffer);
      if (dim.width > 8000 || dim.height > 8000) {
        return ErrorType.INVALID_IMAGE_DIMENSION;
      }
    } catch (error) {
      return ErrorType.INVALID_IMAGE_DIMENSION;
    }
  }
  return ErrorType.NONE;
}

export function hasValidContentLength(data: string, maxLength: number) {
  return data.length <= maxLength;
}

export function isValidImageMimeType(mimeType: string) {
  return mimeType === ImageType.JPG || mimeType === ImageType.PNG;
}

export function isValidAlpha3Code(code: string) {
  const filtered = countries.filter(country => country['alpha-3'] === code);
  return filtered.length !== 0;
}

export function isValidState(code: string) {
  const usStates = states['US'].divisions;
  const stateKeys = Object.keys(usStates);
  const filtered = stateKeys.filter(key => code.substr(code.length - 2) === key.substr(key.length - 2));
  return filtered.length !== 0
}

export function isValidDate(dateString: string) {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return ErrorType.INVALID_DATE_FORMAT;  // Invalid format
  var d = new Date(dateString);
  var dNum = d.getTime();
  if(!dNum && dNum !== 0) return ErrorType.INVALID_DATE; // NaN value, Invalid date
  return d.toISOString().slice(0,10) === dateString ? ErrorType.NONE : ErrorType.INVALID_DATE;
}

export function isValidCountryCode(code: string) {
  const nameFiltered = countries.filter(country => country['name'] === code);
  const alpha2Filtered = countries.filter(country => country['alpha-2'] === code);
  const alpha3Filtered = countries.filter(country => country['alpha-3'] === code);
  const validState = isValidState(code);

  return nameFiltered.length > 0 || alpha2Filtered.length > 0 || alpha3Filtered.length > 0 || validState;
}

