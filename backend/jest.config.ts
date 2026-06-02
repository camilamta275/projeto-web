import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Define a raiz onde os testes serão buscados
  roots: ['<rootDir>/src'],
  // Procura por arquivos com a extensão .test.ts ou .spec.ts
  testMatch: ['**/?(*.)+(spec|test).ts'],
};

export default config;