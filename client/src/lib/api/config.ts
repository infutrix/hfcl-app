// Vite development keeps talking to the Nest development server. In the
// packaged application, Nest serves this UI, so use its actual origin.
export const LOCAL_SERVER_BASE_URL = import.meta.env.DEV
  ? "http://localhost:3001"
  : window.location.origin
