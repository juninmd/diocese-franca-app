import axios from 'axios';
import { readJson, writeJson } from '../src/utils/fileStore';
import { addressCoords } from '../src/utils/geocode';

jest.mock('axios');
jest.mock('../src/utils/fileStore', () => ({ readJson: jest.fn(), writeJson: jest.fn() }));

const mockedGet = axios.get as jest.Mock;
const church = { id: 7, name: 'Paróquia São José', address: 'Rua Nova, 10', city: 'Franca', state: 'SP' };
const silent = { log: jest.fn(), warn: jest.fn() };
const cached = () => ({ '7': { address: 'Rua Velha, 5', latitude: -20.5, longitude: -47.4 } });

describe('addressCoords quando o endereço da paróquia muda', () => {
  beforeEach(() => jest.resetAllMocks());

  it('falha de rede mantém a coordenada em cache (não volta ao centro da cidade)', async () => {
    (readJson as jest.Mock).mockReturnValue(cached());
    mockedGet.mockRejectedValue(new Error('getaddrinfo ENOTFOUND nominatim.openstreetmap.org'));

    const result = await addressCoords([church], {}, { log: silent, delayMs: 0 });

    expect(result['7']).toEqual(cached()['7']);
    expect(writeJson).not.toHaveBeenCalled();
  });

  it('busca concluída sem resultado ainda remove a coordenada antiga', async () => {
    (readJson as jest.Mock).mockReturnValue(cached());
    mockedGet.mockResolvedValue({ data: [] });

    const result = await addressCoords([church], {}, { log: silent, delayMs: 0 });

    expect(result['7']).toBeUndefined();
    expect(writeJson).toHaveBeenCalledWith('addressCoords.json', {});
  });
});
