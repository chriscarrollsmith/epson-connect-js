//Scanner.ts

import { AuthContext } from './Authenticate';

type DestinationType = 'mail' | 'url';

interface Destination {
  id: string;
  alias_name: string;
  destination: string;
  type: DestinationType;
}

interface DestinationsResponse {
  destinations: Destination[];
}

export class Scanner {
  private _authContext: AuthContext;
  private _path: string;
  private _destination_cache: Record<string, Destination>;
  private VALID_DESTINATION_TYPES: Set<DestinationType>;
  private _ready: boolean;
  private _readyPromise: Promise<void>;

  constructor(authContext: AuthContext) {
    if (!(authContext instanceof AuthContext)) {
      throw new ScannerError('AuthContext instance required');
    }

    this._authContext = authContext;
    this._path = `/api/1/scanning/scanners/${this._authContext.deviceId}/destinations`;
    this._destination_cache = {};

    this.VALID_DESTINATION_TYPES = new Set<DestinationType>(['mail', 'url']);

    this._ready = false;
    this._readyPromise = this.init(); // Store the promise to allow awaiting it in other methods
  }

  private async init(): Promise<void> {
    try {
      await this.list();
      this._ready = true;
    } catch (err) {
      console.error('Failed to initialize scanner destination cache:', err);
      throw err; // Rethrow to allow handling by the caller
    }
  }

  private async _ensureReady(): Promise<void> {
    if (!this._ready) {
      await this._readyPromise;
    }
  }

  async list(useCache = false): Promise<DestinationsResponse> {
    if (useCache) {
      await this._ensureReady();
      // Return the values from the cache
      return { destinations: Object.values(this._destination_cache) };
    } else {
      const resp = await this._authContext.send('get', this._path) as DestinationsResponse;
      // Clear the existing cache and re-populate it
      this._destination_cache = {};
      resp.destinations.forEach(dest => this._destination_cache[dest.id] = dest);
      // Return the fresh list from the response
      return resp;
    }
  }

  async add(alias_name: string, destination: string, type_: DestinationType = 'mail'): Promise<Destination> {
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
    const newDestination = updatedList.destinations.find(dest => dest.alias_name === alias_name);
    if (!newDestination) {
      throw new ScannerError('Failed to find newly added destination.');
    }
    return newDestination;
  }

  async update(id_: string, alias_name: string | null = null, destination: string | null = null, type_: DestinationType | null = null): Promise<Destination> {
    await this._ensureReady();
    const destCache = this._destination_cache[id_];
    if (!destCache) {
      throw new ScannerError('Scan destination is not yet registered.');
    }
    const data: Destination = {
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

  async remove(id_: string): Promise<any> {
    await this._ensureReady();
    const data = { id: id_ };
    const resp = await this._authContext.send('delete', this._path, data);
    delete this._destination_cache[id_];
    return resp;
  }

  private _validateDestination(alias_name: string, destination: string, type_: DestinationType): void {
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

export class ScannerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScannerError';
  }
}
