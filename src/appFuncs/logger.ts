let logger: { debug: (...args: any[]) => void };

if (process.env.NODE_ENV === 'production') {
  // In production, debug is a "no-op" (empty function)
  logger = { debug: () => {} };
} else {
  logger = { debug: (...args) => console.log('[DEBUG]', ...args) };
}

export default logger;