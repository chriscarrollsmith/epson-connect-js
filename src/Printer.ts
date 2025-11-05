// Printer.ts

import { URL, URLSearchParams } from 'url';
import { promises as fsPromises } from 'fs';
import axios from 'axios';
import { AuthContext } from './Authenticate';
import { mergeWithDefaultSettings, validateSettings, PrintSettings } from './PrinterSettings';

type Operator = 'user' | 'operator';

interface JobData {
  id: string;
  upload_uri: string;
  settings: Required<PrintSettings>;
}

interface JobInfo {
  status: string;
  [key: string]: any;
}

interface PrinterInfo {
  [key: string]: any;
}

interface CapabilitiesResponse {
  [key: string]: any;
}

interface NotificationResponse {
  [key: string]: any;
}

export class Printer {
  private _authContext: AuthContext;
  private VALID_EXTENSIONS: Set<string>;
  private VALID_OPERATORS: Set<Operator>;

  constructor(authContext: AuthContext) {
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

    this.VALID_OPERATORS = new Set<Operator>([
      'user',
      'operator',
    ]);
  }

  get deviceId(): string {
    return this._authContext.deviceId;
  }

  async capabilities(mode: string): Promise<CapabilitiesResponse> {
    const path = `/api/1/printing/printers/${this.deviceId}/capability/${mode}`;
    const response = await this._authContext.send('get', path);

    return response;
  }

  async printSetting(settings: PrintSettings): Promise<JobData> {
    const mergedSettings = mergeWithDefaultSettings(settings);
    validateSettings(mergedSettings);
    const path = `/api/1/printing/printers/${this.deviceId}/jobs`;
    const response = await this._authContext.send('post', path, mergedSettings);

    // Add settings object to the response
    response.settings = mergedSettings;

    return response;
  }

  async uploadFile(uploadUri: string, filePath: string, printMode: string): Promise<any> {
    const extension = filePath.split('.').pop()?.toLowerCase();
    if (!extension || !this.VALID_EXTENSIONS.has(extension)) {
      throw new PrinterError(`${extension} is not a valid printing extension.`);
    }

    const urlObj = new URL(uploadUri);
    const qDict = Object.fromEntries(urlObj.searchParams.entries());
    qDict.Key = qDict.Key;
    qDict.File = `1.${extension}`;
    urlObj.search = new URLSearchParams(qDict).toString();
    const path = urlObj.pathname + urlObj.search;

    const contentType = printMode === 'photo' ? 'image/jpeg' : 'application/octet-stream';

    let data: Buffer;

    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      // Use axios to fetch the file data as an arraybuffer
      const response = await axios.get(filePath, { responseType: 'arraybuffer' });
      data = Buffer.from(response.data, 'binary');
    } else {
      // It's a local file path, read the file using fs
      data = await fsPromises.readFile(filePath);
    }

    const uploadResponse = await this._authContext.send('post', path, data, { 'Content-Type': contentType, 'Content-Length': data.length.toString() });

    return uploadResponse;
  }

  async executePrint(jobId: string): Promise<any> {
    const path = `/api/1/printing/printers/${this.deviceId}/jobs/${jobId}/print`;
    const response = await this._authContext.send('post', path);

    return response;
  }

  async print(filePath: string, settings: PrintSettings = {}): Promise<string> {
    const jobData = await this.printSetting(settings);
    await this.uploadFile(jobData.upload_uri, filePath, jobData.settings.print_mode);
    await this.executePrint(jobData.id);
    return jobData.id;
  }

  async cancelPrint(jobId: string, operatedBy: Operator = 'user'): Promise<any> {
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

  async jobInfo(jobId: string): Promise<JobInfo> {
    const path = `/api/1/printing/printers/${this.deviceId}/jobs/${jobId}`;
    const response = await this._authContext.send('get', path);

    return response;
  }

  async info(): Promise<PrinterInfo> {
    const path = `/api/1/printing/printers/${this.deviceId}`;
    const response = await this._authContext.send('get', path);

    return response;
  }

  async notification(callbackUri: string, enabled = true): Promise<NotificationResponse> {
    const path = `/api/1/printing/printers/${this.deviceId}/settings/notifications`;
    const response = await this._authContext.send('post', path, { notification: enabled, callback_uri: callbackUri });

    return response;
  }
}

export class PrinterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrinterError';
  }
}
