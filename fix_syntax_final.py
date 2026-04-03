with open('soul-app-backend/src/routes/index.ts', 'r') as f:
    c = f.read()
c = c.replace("moments: momentsResult.rows\n    });", "moments: momentsResult.rows\n    });")
with open('soul-app-backend/src/routes/index.ts', 'w') as f:
    f.write(c)

with open('soul-app-backend/src/routes/user.routes.ts', 'r') as f:
    c = f.read()
c = c.replace("      moments: momentsResult.rows\n    });\n  } catch (error) {", "      moments: momentsResult.rows\n    });\n  } catch (error) {")
with open('soul-app-backend/src/routes/user.routes.ts', 'w') as f:
    f.write(c)
