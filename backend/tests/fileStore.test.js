const fs = require('fs');
const path = require('path');
const { writeIfSane, readJson, readCached, DATA_DIR } = require('../utils/fileStore');

const FILE = '__fileStore_test.json';
const target = path.join(DATA_DIR, FILE);
const silent = { warn: jest.fn(), log: jest.fn() };

afterEach(() => {
  [target, `${target}.${process.pid}.tmp`].forEach((f) => fs.existsSync(f) && fs.unlinkSync(f));
  silent.warn.mockClear();
});

describe('writeIfSane', () => {
  it('grava quando não há arquivo anterior e não deixa temporários', () => {
    expect(writeIfSane(FILE, [{ id: 1 }], { log: silent })).toBe(true);
    expect(readJson(FILE)).toEqual([{ id: 1 }]);
    expect(fs.existsSync(`${target}.${process.pid}.tmp`)).toBe(false);
  });

  it('recusa lista vazia e preserva o arquivo atual', () => {
    writeIfSane(FILE, [{ id: 1 }, { id: 2 }], { log: silent });
    expect(writeIfSane(FILE, [], { log: silent })).toBe(false);
    expect(readJson(FILE)).toHaveLength(2);
    expect(silent.warn).toHaveBeenCalled();
  });

  it('recusa encolhimento brusco, mas aceita o limite configurado', () => {
    writeIfSane(FILE, Array.from({ length: 10 }, (_, id) => ({ id })), { log: silent });
    expect(writeIfSane(FILE, [{ id: 1 }, { id: 2 }], { log: silent })).toBe(false);
    expect(writeIfSane(FILE, Array.from({ length: 7 }, (_, id) => ({ id })), { log: silent })).toBe(true);
  });
});

describe('readCached', () => {
  it('relê o arquivo quando o mtime muda e devolve o fallback se ausente', () => {
    expect(readCached(FILE, ['vazio'], 0)).toEqual(['vazio']);
    fs.writeFileSync(target, JSON.stringify([1]));
    expect(readCached(FILE, [], 0)).toEqual([1]);
    const first = readCached(FILE, [], 0);
    expect(readCached(FILE, [], 0)).toBe(first); // mesmo objeto: não releu
    fs.writeFileSync(target, JSON.stringify([1, 2]));
    fs.utimesSync(target, new Date(), new Date(Date.now() + 5000));
    expect(readCached(FILE, [], 0)).toEqual([1, 2]);
  });
});
