//PrinterSettings.js

const VALID_PRINT_MODES = new Set([
    'document',
    'photo',
  ]);
  
  const VALID_MEDIA_SIZES = new Set([
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
  
  const VALID_MEDIA_TYPES = new Set([
    'mt_plainpaper',
    'mt_photopaper',
    'mt_hagaki',
    'mt_hagakiphoto',
    'mt_hagakiinkjet',
  ]);
  
  const VALID_PRINT_QUALITIES = new Set([
    'high',
    'normal',
    'draft',
  ]);
  
  const VALID_PAPER_SOURCES = new Set([
    'auto',
    'rear',
    'front1',
    'front2',
    'front3',
    'front4',
  ]);
  
  const VALID_COLOR_MODES = new Set([
    'color',
    'mono',
  ]);
  
  const VALID_TWO_SIDE = new Set([
    'none',
    'long',
    'short',
  ]);
  
  function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
  }
  
  function mergeWithDefaultSettings(settings = {}) {
    settings.job_name = settings.job_name || `job-${generateRandomString(8)}`;
  
    settings.print_mode = settings.print_mode || 'document';
  
    settings.print_setting = settings.print_setting || {};
  
    const printSetting = settings.print_setting;
    if (Object.keys(printSetting).length !== 0) {
      printSetting.media_size = printSetting.media_size || 'ms_a4';
      printSetting.media_type = printSetting.media_type || 'mt_plainpaper';
      printSetting.borderless = printSetting.borderless || false;
      printSetting.print_quality = printSetting.print_quality || 'normal';
      printSetting.source = printSetting.source || 'auto';
      printSetting.color_mode = printSetting.color_mode || 'color';
      printSetting.two_sided = printSetting.two_sided || 'none';
      printSetting.reverse_order = printSetting.reverse_order || false;
      printSetting.copies = printSetting.copies || 1;
      printSetting.collate = printSetting.collate === undefined ? true : printSetting.collate;
    }
  
    return settings;
  }
  
  function validateSettings(settings = {}) {
    const extraKeys = Object.keys(settings).filter(key => !['job_name', 'print_mode', 'print_setting'].includes(key));
    if (extraKeys.length > 0) {
      throw new PrintSettingError(`Invalid settings keys ${extraKeys.join(', ')}.`);
    }
  
    const jobName = settings.job_name;
    if (jobName.length > 256) {
      throw new PrintSettingError(`Job name is greater than 256 chars: ${jobName}`);
    }
  
    const printMode = settings.print_mode;
    if (!VALID_PRINT_MODES.has(printMode)) {
      throw new PrintSettingError(`Invalid print mode ${printMode}`);
    }
  
    const printSetting = settings.print_setting;
    if (!printSetting) {
      return;
    }
  
    // Media Size
    const mediaSize = printSetting.media_size;
    if (!VALID_MEDIA_SIZES.has(mediaSize)) {
      throw new PrintSettingError(`Invalid paper size ${mediaSize}`);
    }
  
    // media_type
    const mediaType = printSetting.media_type;
    if (!VALID_MEDIA_TYPES.has(mediaType)) {
      throw new PrintSettingError(`Invalid media type ${mediaType}`);
    }
  
    // borderless
    const borderless = printSetting.borderless;
    if (typeof borderless !== 'boolean') {
      throw new PrintSettingError('borderless must be a bool');
    }
  
    // print_quality
    const printQuality = printSetting.print_quality;
    if (!VALID_PRINT_QUALITIES.has(printQuality)) {
      throw new PrintSettingError(`Invalid print quality ${printQuality}`);
    }
  
    // Paper source
    const source = printSetting.source;
    if (!VALID_PAPER_SOURCES.has(source)) {
      throw new PrintSettingError(`Invalid source ${source}`);
    }
  
    // color_mode
    const colorMode = printSetting.color_mode;
    if (!VALID_COLOR_MODES.has(colorMode)) {
      throw new PrintSettingError(`Invalid color mode ${colorMode}`);
    }
  
    // two_sided
    const twoSided = printSetting.two_sided;
    if (!VALID_TWO_SIDE.has(twoSided)) {
      throw new PrintSettingError(`Invalid 2-sided value ${twoSided}`);
    }
  
    // reverse_order
    const reverseOrder = printSetting.reverse_order;
    if (typeof reverseOrder !== 'boolean') {
      throw new PrintSettingError('Reverse order must be a bool');
    }
  
    if (['long', 'short'].includes(twoSided) && reverseOrder) {
      throw new PrintSettingError('Can not use reverse order when using two-sided printing.');
    }
  
    // copies
    const copies = printSetting.copies;
    if (copies < 1 || copies > 99) {
      throw new PrintSettingError(`Invalid number of copies ${copies}`);
    }
  
    // collate
    const collate = printSetting.collate;
    if (typeof collate !== 'boolean') {
      throw new PrintSettingError('Collate must be a bool');
    }
  
    if (['long', 'short'].includes(twoSided) && !collate) {
      throw new PrintSettingError('Must collate when using two-sided printing.');
    }
  }  
  
  class PrintSettingError extends Error {
    constructor(message) {
      super(message);
      this.name = 'PrintSettingError';
    }
  }
  
  module.exports = { mergeWithDefaultSettings, validateSettings, PrintSettingError };
  