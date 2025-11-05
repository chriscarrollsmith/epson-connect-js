// index.ts - Main entry point

export { Client, ClientError } from './Client';
export { Printer, PrinterError } from './Printer';
export { Scanner, ScannerError } from './Scanner';
export { AuthContext, AuthenticationError, ApiError } from './Authenticate';
export {
  PrintSettings,
  PrintSetting,
  PrintMode,
  MediaSize,
  MediaType,
  PrintQuality,
  PaperSource,
  ColorMode,
  TwoSided,
  PrintSettingError,
  mergeWithDefaultSettings,
  validateSettings,
} from './PrinterSettings';
