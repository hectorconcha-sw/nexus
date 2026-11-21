function getApiUrl(): string {
  if (process.env.API_URL) {
    return process.env.API_URL;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000/api/v1';
  }

  throw new Error('CRITICAL: API_URL environment variable is not set in production!');
}

export const config = {
  apiUrl: getApiUrl(),
};
