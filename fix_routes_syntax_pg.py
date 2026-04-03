with open('soul-app-backend/src/routes.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    # we need to remove the leftover sqlite snippet that caused syntax error
    if "const result = await db.run(`" in line:
        skip = True

    if skip and "});" in line and "Internal Server Error" in lines[i-2]:
        skip = False
        continue

    if not skip:
        new_lines.append(line)

with open('soul-app-backend/src/routes.ts', 'w') as f:
    f.writelines(new_lines)
