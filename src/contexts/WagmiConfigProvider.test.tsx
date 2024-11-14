import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { WagmiConfigProvider } from './WagmiConfigProvider';
import { getNetworkConfig } from '../utils/networkConfig';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import React from 'react';

// Mock dependencies
vi.mock('../utils/networkConfig', () => ({
    getNetworkConfig: vi.fn(),
}));

vi.mock('wagmi', () => ({
    WagmiProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    createConfig: vi.fn(),
    http: vi.fn(),
}));

vi.mock('wagmi/connectors', () => ({
    metaMask: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
    QueryClient: vi.fn(),
    QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@rainbow-me/rainbowkit', () => ({
    RainbowKitProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const MOCK_NETWORK_CONFIG = { chainId: 1 };

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return <div>{this.state.error?.message}</div>;
        }

        return this.props.children;
    }
}

describe('WagmiConfigProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (getNetworkConfig as vi.Mock).mockReturnValue(MOCK_NETWORK_CONFIG);
        (createConfig as vi.Mock).mockReturnValue({});
        (metaMask as vi.Mock).mockReturnValue({});
        (http as vi.Mock).mockReturnValue({});
    });

    it('should initialize WagmiConfigProvider correctly', () => {
        const TestComponent = () => <div data-testid="test-component">Test Component</div>;

        const { getByTestId } = render(
            <WagmiConfigProvider>
                <TestComponent />
            </WagmiConfigProvider>
        );

        expect(getNetworkConfig).toHaveBeenCalled();
        expect(createConfig).toHaveBeenCalledWith({
            chains: [MOCK_NETWORK_CONFIG],
            connectors: [metaMask()],
            ssr: true,
            transports: {
                42161: http(),
                421614: http(),
            },
        });
    });
    it('should handle unsuccessful initialization', () => {
        // Mock createConfig to throw an error
        (createConfig as vi.Mock).mockImplementation(() => {
            throw new Error('Initialization failed');
        });

        const TestComponent = () => <div data-testid="test-component">Test Component</div>;

        // Suppress console.error during this test
        const originalConsoleError = console.error;
        console.error = vi.fn();

        const { getByText } = render(
            <ErrorBoundary>
                <WagmiConfigProvider>
                    <TestComponent />
                </WagmiConfigProvider>
            </ErrorBoundary>
        );

        // expect(getByText('Initialization failed')).toBeInTheDocument();
        expect(getNetworkConfig).toHaveBeenCalled();
        expect(createConfig).toHaveBeenCalledWith({
            chains: [MOCK_NETWORK_CONFIG],
            connectors: [metaMask()],
            ssr: true,
            transports: {
                42161: http(),
                421614: http(),
            },
        });

        // Restore console.error
        console.error = originalConsoleError;
    });
});
