import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock server-only to prevent errors in test environment
vi.mock('server-only', () => ({}))
