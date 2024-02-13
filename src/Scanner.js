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

    this.VALID_DESTINATION_TYPES = new Set(['mail', 'url']);

    this._ready = false;
    this._readyPromise = this.init(); // Store the promise to allow awaiting it in other methods
  }

  async init() {
    try {
      await this.list();
      this._ready = true;
    } catch (err) {
      console.error('Failed to initialize scanner destination cache:', err);
      throw err; // Rethrow to allow handling by the caller
    }
  }

  async _ensureReady() {
    if (!this._ready) {
      await this._readyPromise;
    }
  }
  
  async list(useCache = false) {
    if (useCache) {
        await this._ensureReady();
        // Return the values from the cache
        return { destinations: Object.values(this._destination_cache) };
    } else {
        const resp = await this._authContext.send('get', this._path);
        // Clear the existing cache and re-populate it
        this._destination_cache = {};
        resp.destinations.forEach(dest => this._destination_cache[dest.id] = dest);
        // Return the fresh list from the response
        return resp;
    }
  }
  
  async add(alias_name, destination, type_ = 'mail') {
    await this._ensureReady();
    this._validateDestination(alias_name, destination, type_);
    const data = {
      alias_name: alias_name,
      destination: destination,
      type: type_
    };
    const resp = await this._authContext.send('post', this._path, data);
    if (resp.message !== 'Request was successful, but no data was returned.') {
      throw new ScannerError('Failed to add scanner destination.');
    }
    const updatedList = await this.list();
    // Find the newly added destination in updatedList.destinations and return it
    return updatedList.destinations.find(dest => dest.alias_name === alias_name);
  }
  
  async update(id_, alias_name = null, destination = null, type_ = null) {
    await this._ensureReady();
    const destCache = this._destination_cache[id_];
    if (!destCache) {
      throw new ScannerError('Scan destination is not yet registered.');
    }
    const data = {
      id: id_,
      alias_name: alias_name || destCache.alias_name,
      destination: destination || destCache.destination,
      type: type_ || destCache.type
    };
    this._validateDestination(data.alias_name, data.destination, data.type);
    const resp = await this._authContext.send('put', this._path, data);
    if (resp.message !== 'Request was successful, but no data was returned.') {
      throw new ScannerError('Failed to add scanner destination.');
    }
    this._destination_cache[id_] = data;
    return data;
  }
  
  async remove(id_) {
    await this._ensureReady();
    const data = { id: id_ };
    const resp = await this._authContext.send('delete', this._path, data);
    delete this._destination_cache[id_];
    return resp;
  }
  
  _validateDestination(alias_name, destination, type_) {
    if (alias_name.length < 1 || alias_name.length > 32) {
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
