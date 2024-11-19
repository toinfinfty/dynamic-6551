// import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Setup handlers
afterEach(() => {
    cleanup();
});

// Extend global for ethereum
declare global {
    interface Window {
        ethereum?: {
            request: () => Promise<any>;
            on: (event: string, callback: () => void) => void;
            removeListener: (event: string, callback: () => void) => void;
        };
    }
}

// Mock ethereum object
const mockEthereum = {
    request: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
};

// Properly set ethereum on window
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'ethereum', {
        configurable: true,
        writable: true,
        value: mockEthereum,
    });
}

// If running in Node environment, mock window
if (typeof global.window === 'undefined') {
    (global as any).window = {
        ethereum: mockEthereum,
    };
}
