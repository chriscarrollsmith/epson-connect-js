//Scanner.js

const { AuthContext } = require('./Authenticate.js');

class Scanner {
  constructor(authContext) {
    if (!(authContext instanceof AuthContext)) {
      throw new ScannerError('AuthContext instance required');
    }
    
    this._authContext = authContext;
    this._path = `/api/1/scanning/scanners/${this._authContext.deviceId}/destinations`;
    this._destination_cache = {};
    
    this.VALID_DESTINATION_TYPES = new Set([
      'mail',
      'url',
    ]);
  }
  
  async list() {
    return this._authContext.send('get', this._path);
  }
  
  async add(name, destination, type_ = 'mail') {
    this._validateDestination(name, destination, type_);
    const data = {
      alias_name: name,
      type: type_,
      destination: destination,
    };
    const resp = await this._authContext.send('post', this._path, data);
    this._destination_cache[resp.id] = resp;
    return resp;
  }
  
  async update(id_, name = null, destination = null, type_ = null) {
    const destCache = this._destination_cache[id_];
    if (!destCache) {
      throw new ScannerError('Scan destination is not yet registered.');
    }
    this._validateDestination(name, destination, type_);
    const data = {
      id: id_,
      alias_name: name || destCache.alias_name,
      type: type_ || destCache.type,
      destination: destination || destCache.destination,
    };
    const resp = await this._authContext.send('post', this._path, data);
    this._destination_cache[id_] = resp;
    return resp;
  }
  
  async remove(id_) {
    const data = { id: id_ };
    await this._authContext.send('delete', this._path, data);
    delete this._destination_cache[id_];
  }
  
  _validateDestination(name, destination, type_) {
    if (name.length < 1 || name.length > 32) {
      throw new ScannerError('Scan destination name too long.');
    }
    if (destination.length < 4 || destination.length > 544) {
      throw new ScannerError('Scan destination too long.');
    }
    if (!this.VALID_DESTINATION_TYPES.has(type_)) {
      throw new ScannerError(`Invalid scan destination type ${type_}.`);
    }
  }
}

class ScannerError extends Error {}

module.exports = { Scanner, ScannerError };
