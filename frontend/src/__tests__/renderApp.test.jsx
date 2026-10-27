import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../app/App';
import Providers from '../app/Providers';

// Mock localStorage for test environment
const mockStorage = {};
const localStorageMock = {
  getItem: vi.fn((key) => mockStorage[key] || null),
  setItem: vi.fn((key, value) => { mockStorage[key] = String(value); }),
  removeItem: vi.fn((key) => { delete mockStorage[key]; }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  })
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock fetch for site settings and counsellor API endpoints
beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((url) => {
    return Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({
        success: true,
        data: {
          siteName: 'BEHOLD',
          enablePsychology: true,
          enableCareerMentoring: true
        }
      })),
      json: () => Promise.resolve({
        success: true,
        data: {
          siteName: 'BEHOLD',
          enablePsychology: true,
          enableCareerMentoring: true
        }
      })
    });
  });
});

describe('Full Application Root Render', () => {
  it('renders the application home page without crashing', async () => {
    const { container } = render(
      <Providers>
        <App />
      </Providers>
    );

    expect(container).toBeDefined();
    // Verify hero section heading is present in DOM
    const heroHeading = await screen.findByRole('heading', { level: 1 });
    expect(heroHeading).toBeDefined();
  });
});
