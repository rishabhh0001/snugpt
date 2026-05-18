import os
import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Change all /lander links to /
    content = content.replace('href="/lander"', 'href="/"')
    
    # In lander page (now page.tsx), update the button to route to /chat
    if filepath.endswith('page.tsx') and 'Access Intelligence' in content or 'Access Engine' in content:
        # Instead of just opening waitlist, let's change onClick to router.push('/chat')
        # Wait, let's just wrap the button in <Link href="/chat"> or add href
        pass # I will do this manually for the button to be safe

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            update_file(os.path.join(root, file))
