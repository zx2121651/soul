import re

with open('soul-app-web/src/App.tsx', 'r') as f:
    content = f.read()

# Auto silent login logic on App mount
auto_login = """
  // Silent Login / Token Injection
  useEffect(() => {
    const token = localStorage.getItem('soul_token');
    if (!token) {
      api.post<{token: string}>('/auth/login', { username: 'test' })
        .then(data => {
          if (data && data.token) {
            localStorage.setItem('soul_token', data.token);
            console.log('Silent login successful');
          }
        })
        .catch(console.error);
    }
  }, []);
"""

content = content.replace("export default function App() {\n  const [activeTab", "export default function App() {\n" + auto_login + "\n  const [activeTab")

# ensure useEffect is imported
if "import { useState, useEffect }" not in content:
    content = content.replace("import { useState }", "import { useState, useEffect }")

with open('soul-app-web/src/App.tsx', 'w') as f:
    f.write(content)
