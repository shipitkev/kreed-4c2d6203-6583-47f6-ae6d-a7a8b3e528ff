// This file is only used in test environment
// It should not be included in the app build

// Only execute in test environment
if (typeof jest !== 'undefined') {
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  
  // Only set global if it exists (Node.js test environment)
  if (typeof global !== 'undefined') {
    (global as any).localStorage = localStorageMock;
  }
  
  // Mock window
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  }
}

