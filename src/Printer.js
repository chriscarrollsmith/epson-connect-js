// Printer.js

const { URL, URLSearchParams } = require('url');
const fs = require('fs');
const { AuthContext } = require('./Authenticate.js');
const { mergeWithDefaultSettings, validateSettings } = require('./PrinterSettings');

class Printer {
  constructor(authContext) {
    if (!(authContext instanceof AuthContext)) {
      throw new PrinterError('AuthContext instance required');
    }
    
    this._authContext = authContext;
    
    this.VALID_EXTENSIONS = new Set([
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'pdf',
      'jpeg',
      'jpg',
      'bmp',
      'gif',
      'png',
      'tiff',
    ]);
    
    this.VALID_OPERATORS = new Set([
      'user',
      'operator',
    ]);
  }
  
  get deviceId() {
    return this._authContext.deviceId;
  }
  
  async capabilities(mode) {
    const path = `/api/1/printing/printers/${this.deviceId}/capability/${mode}`;
    const response = await this._authContext.send('get', path);

    return response;
  }
  
  async printSetting(settings) {
    settings = mergeWithDefaultSettings(settings);
    validateSettings(settings);
    const path = `/api/1/printing/printers/${this.deviceId}/jobs`;
    const response = await this._authContext.send('post', path, settings);

    // Add settings object to the response
    response.settings = settings;

    return response;
  }
  
  async uploadFile(uploadUri, filePath, printMode) {
    const extension = filePath.split('.').pop().toLowerCase();
    if (!this.VALID_EXTENSIONS.has(extension)) {
      throw new PrinterError(`${extension} is not a valid printing extension.`);
    }
    
    const urlObj = new URL(uploadUri);
    const qDict = Object.fromEntries(urlObj.searchParams.entries());
    qDict.Key = qDict.Key;
    qDict.File = `1.${extension}`;
    urlObj.search = new URLSearchParams(qDict).toString();
    const path = urlObj.pathname + urlObj.search;
    
    const contentType = printMode === 'photo' ? 'image/jpeg' : 'application/octet-stream';
    const data = await fs.promises.readFile(filePath);
    
    const response = await this._authContext.send('post', path, data, { 'Content-Type': contentType, 'Content-Length': data.length.toString() });
    
    return response;
  }
  
  async executePrint(jobId) {
    const path = `/api/1/printing/printers/${this.deviceId}/jobs/${jobId}/print`;
    const response = await this._authContext.send('post', path);

    return response;
  }
  
  async print(filePath, settings = {}) {
    const jobData = await this.printSetting(settings);
    await this.uploadFile(jobData.upload_uri, filePath, jobData.settings.print_mode);
    await this.executePrint(jobData.id);
    return jobData.id;
  }
  
  async cancelPrint(jobId, operatedBy = 'user') {
    if (!this.VALID_OPERATORS.has(operatedBy)) {
      throw new PrinterError(`Invalid "operated_by" value ${operatedBy}`);
    }
    
    const jobStatus = (await this.jobInfo(jobId)).status;
    if (!['pending', 'pending_held'].includes(jobStatus)) {
      throw new PrinterError(`Can not cancel job with status ${jobStatus}`);
    }
    
    const path = `/api/1/printing/printers/${this.deviceId}/jobs/${jobId}/cancel`;
    const response = await this._authContext.send('post', path, { operated_by: operatedBy });

    return response;
  }
  
  async jobInfo(jobId) {
    const path = `/api/1/printing/printers/${this.deviceId}/jobs/${jobId}`;
    const response = await this._authContext.send('get', path);

    return response;
  }
  
  async info() {
    const path = `/api/1/printing/printers/${this.deviceId}`;
    const response = await this._authContext.send('get', path);

    return response;
  }
  
  async notification(callbackUri, enabled = true) {
    const path = `/api/1/printing/printers/${this.deviceId}/settings/notifications`;
    const response = await this._authContext.send('post', path, { notification: enabled, callback_uri: callbackUri });

    return response;
  }
}

class PrinterError extends Error {}

module.exports = { Printer, PrinterError };
