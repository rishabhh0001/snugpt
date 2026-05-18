import re

with open('src/app/lander/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'backdrop-blur-[a-z0-9]+', '', content)
content = re.sub(r'blur-\[?\d+px\]?', 'hidden', content)
content = re.sub(r'blur-(xl|2xl|3xl)', 'hidden', content)
content = re.sub(r'filter:\s*[\'\"`]blur\([^)]*\)[\'\"`],?', '', content)

with open('src/app/lander/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
