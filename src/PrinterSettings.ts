//PrinterSettings.ts

export type PrintMode = 'document' | 'photo';
export type MediaSize =
  | 'ms_a3' | 'ms_a4' | 'ms_a5' | 'ms_a6' | 'ms_b5'
  | 'ms_tabloid' | 'ms_letter' | 'ms_legal' | 'ms_halfletter'
  | 'ms_kg' | 'ms_l' | 'ms_2l' | 'ms_10x12' | 'ms_8x10'
  | 'ms_hivision' | 'ms_5x8' | 'ms_postcard';
export type MediaType = 'mt_plainpaper' | 'mt_photopaper' | 'mt_hagaki' | 'mt_hagakiphoto' | 'mt_hagakiinkjet';
export type PrintQuality = 'high' | 'normal' | 'draft';
export type PaperSource = 'auto' | 'rear' | 'front1' | 'front2' | 'front3' | 'front4';
export type ColorMode = 'color' | 'mono';
export type TwoSided = 'none' | 'long' | 'short';

export interface PrintSetting {
  media_size?: MediaSize;
  media_type?: MediaType;
  borderless?: boolean;
  print_quality?: PrintQuality;
  source?: PaperSource;
  color_mode?: ColorMode;
  two_sided?: TwoSided;
  reverse_order?: boolean;
  copies?: number;
  collate?: boolean;
}

export interface PrintSettings {
  job_name?: string;
  print_mode?: PrintMode;
  print_setting?: PrintSetting;
}

const VALID_PRINT_MODES = new Set<PrintMode>([
  'document',
  'photo',
]);

const VALID_MEDIA_SIZES = new Set<MediaSize>([
  'ms_a3',
  'ms_a4',
  'ms_a5',
  'ms_a6',
  'ms_b5',
  'ms_tabloid',
  'ms_letter',
  'ms_legal',
  'ms_halfletter',
  'ms_kg',
  'ms_l',
  'ms_2l',
  'ms_10x12',
  'ms_8x10',
  'ms_hivision',
  'ms_5x8',
  'ms_postcard',
]);

const VALID_MEDIA_TYPES = new Set<MediaType>([
  'mt_plainpaper',
  'mt_photopaper',
  'mt_hagaki',
  'mt_hagakiphoto',
  'mt_hagakiinkjet',
]);

const VALID_PRINT_QUALITIES = new Set<PrintQuality>([
  'high',
  'normal',
  'draft',
]);

const VALID_PAPER_SOURCES = new Set<PaperSource>([
  'auto',
  'rear',
  'front1',
  'front2',
  'front3',
  'front4',
]);

const VALID_COLOR_MODES = new Set<ColorMode>([
  'color',
  'mono',
]);

const VALID_TWO_SIDE = new Set<TwoSided>([
  'none',
  'long',
  'short',
]);

function generateRandomString(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
}

export function mergeWithDefaultSettings(settings: PrintSettings = {}): Required<PrintSettings> {
  const job_name = settings.job_name || `job-${generateRandomString(8)}`;
  const print_mode = settings.print_mode || 'document';

  const printSetting = settings.print_setting || {};

  const media_size = printSetting.media_size || 'ms_a4';
  const media_type = printSetting.media_type || 'mt_plainpaper';
  const borderless = printSetting.borderless || false;
  const print_quality = printSetting.print_quality || 'normal';
  const source = printSetting.source || 'auto';
  const color_mode = printSetting.color_mode || 'color';
  const two_sided = printSetting.two_sided || 'none';
  const reverse_order = printSetting.reverse_order || false;
  const copies = printSetting.copies || 1;
  const collate = printSetting.collate === undefined ? true : printSetting.collate;

  return {
    job_name,
    print_mode,
    print_setting: {
      media_size,
      media_type,
      borderless,
      print_quality,
      source,
      color_mode,
      two_sided,
      reverse_order,
      copies,
      collate,
    },
  };
}

export function validateSettings(settings: PrintSettings = {}): void {
  const extraKeys = Object.keys(settings).filter(key => !['job_name', 'print_mode', 'print_setting'].includes(key));
  if (extraKeys.length > 0) {
    throw new PrintSettingError(`Invalid settings keys ${extraKeys.join(', ')}.`);
  }

  const jobName = settings.job_name;
  if (jobName && jobName.length > 256) {
    throw new PrintSettingError(`Job name is greater than 256 chars: ${jobName}`);
  }

  const printMode = settings.print_mode;
  if (printMode && !VALID_PRINT_MODES.has(printMode)) {
    throw new PrintSettingError(`Invalid print mode ${printMode}`);
  }

  const printSetting = settings.print_setting;
  if (!printSetting) {
    return;
  }

  // Media Size
  const mediaSize = printSetting.media_size;
  if (mediaSize && !VALID_MEDIA_SIZES.has(mediaSize)) {
    throw new PrintSettingError(`Invalid paper size ${mediaSize}`);
  }

  // media_type
  const mediaType = printSetting.media_type;
  if (mediaType && !VALID_MEDIA_TYPES.has(mediaType)) {
    throw new PrintSettingError(`Invalid media type ${mediaType}`);
  }

  // borderless
  const borderless = printSetting.borderless;
  if (borderless !== undefined && typeof borderless !== 'boolean') {
    throw new PrintSettingError('borderless must be a bool');
  }

  // print_quality
  const printQuality = printSetting.print_quality;
  if (printQuality && !VALID_PRINT_QUALITIES.has(printQuality)) {
    throw new PrintSettingError(`Invalid print quality ${printQuality}`);
  }

  // Paper source
  const source = printSetting.source;
  if (source && !VALID_PAPER_SOURCES.has(source)) {
    throw new PrintSettingError(`Invalid source ${source}`);
  }

  // color_mode
  const colorMode = printSetting.color_mode;
  if (colorMode && !VALID_COLOR_MODES.has(colorMode)) {
    throw new PrintSettingError(`Invalid color mode ${colorMode}`);
  }

  // two_sided
  const twoSided = printSetting.two_sided;
  if (twoSided && !VALID_TWO_SIDE.has(twoSided)) {
    throw new PrintSettingError(`Invalid 2-sided value ${twoSided}`);
  }

  // reverse_order
  const reverseOrder = printSetting.reverse_order;
  if (reverseOrder !== undefined && typeof reverseOrder !== 'boolean') {
    throw new PrintSettingError('Reverse order must be a bool');
  }

  if (twoSided && ['long', 'short'].includes(twoSided) && reverseOrder) {
    throw new PrintSettingError('Can not use reverse order when using two-sided printing.');
  }

  // copies
  const copies = printSetting.copies;
  if (copies !== undefined && (copies < 1 || copies > 99)) {
    throw new PrintSettingError(`Invalid number of copies ${copies}`);
  }

  // collate
  const collate = printSetting.collate;
  if (collate !== undefined && typeof collate !== 'boolean') {
    throw new PrintSettingError('Collate must be a bool');
  }

  if (twoSided && ['long', 'short'].includes(twoSided) && collate === false) {
    throw new PrintSettingError('Must collate when using two-sided printing.');
  }
}

export class PrintSettingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrintSettingError';
  }
}
