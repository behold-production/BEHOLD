import os
import re

components = [
    r'd:\MERN\behold-aspire\frontend\src\components\users\StudentProfile.jsx',
    r'd:\MERN\behold-aspire\frontend\src\components\counsellors\PsychologistDashboard.jsx'
]

def inject_break_all(match):
    full_match = match.group(0)
    tag_start = match.group(1)
    classes = match.group(2)
    inner_content = match.group(3)
    
    if re.search(r'\{[a-zA-Z0-9_]+\.(?:email|id)\}', inner_content):
        if 'break-all' not in classes and 'truncate' not in classes and 'whitespace-nowrap' not in classes:
            new_classes = classes + ' break-all'
            return full_match.replace(f'className="{classes}"', f'className="{new_classes}"')
    
    return full_match

pattern = re.compile(r'(<(?:span|p|div|h4)\s+(?:[^>]*?\s+)?className="([^"]+)"[^>]*>)([^<]+</(?:span|p|div|h4)>)')

for path in components:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = pattern.sub(inject_break_all, content)
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Injected break-all into {os.path.basename(path)}!")

