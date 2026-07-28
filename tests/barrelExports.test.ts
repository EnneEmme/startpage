import { describe, it, expect } from 'vitest';
import * as engine from '../src/engine';
import * as components from '../src/components';
import * as hooks from '../src/hooks';
import * as stores from '../src/stores';

describe('Barrel Exports', () => {
  it('should export engine modules', () => {
    expect(engine).toBeDefined();
    expect(engine.dataStore).toBeDefined();
  });

  it('should export components', () => {
    expect(components).toBeDefined();
    expect(components.ColumnGrid).toBeDefined();
  });

  it('should export hooks', () => {
    expect(hooks).toBeDefined();
    expect(hooks.useModals).toBeDefined();
  });

  it('should export stores', () => {
    expect(stores).toBeDefined();
  });
});
