import re

with open('soul-app-backend/src/routes/user.routes.ts', 'r') as f:
    c = f.read()
c = re.sub(r"moments: momentsResult\.rows\n      \} catch", "moments: momentsResult.rows\n    });\n  } catch", c)
with open('soul-app-backend/src/routes/user.routes.ts', 'w') as f:
    f.write(c)

with open('soul-app-backend/src/routes/index.ts', 'r') as f:
    c = f.read()
c = re.sub(r"moments: momentsResult\.rows\n    \);\n  \} catch", "moments: momentsResult.rows\n    });\n  } catch", c)
with open('soul-app-backend/src/routes/index.ts', 'w') as f:
    f.write(c)
