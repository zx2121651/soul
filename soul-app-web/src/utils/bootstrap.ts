import { api } from '../api/client';

export async function bootstrapApp() {
  if (!import.meta.env.DEV) return; // STRICT ENVIRONMENT GUARD

  const token = localStorage.getItem('soul_token');
  if (!token) {
    const mockUsername = 'testuser_' + Math.floor(Math.random() * 10000);
    const mockPassword = 'testpassword123';

    try {
      // Register
      await api.post('/auth/register', { name: '开发测试号', username: mockUsername, password: mockPassword });

      // Login
      const data = await api.post<{token: string}>('/auth/login', { username: mockUsername, password: mockPassword });

      if (data && data.token) {
        localStorage.setItem('soul_token', data.token);
        console.log('✅ Silent dev registration & login successful');
      }
    } catch (error) {
      console.error('❌ Bootstrap auth failed:', error);
    }
  }
}
