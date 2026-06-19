import os
import re

components = [
    r'd:\MERN\behold-aspire\frontend\src\components\users\StudentProfile.jsx',
    r'd:\MERN\behold-aspire\frontend\src\components\counsellors\PsychologistDashboard.jsx'
]

def inject_class(match):
    tag = match.group(1)
    classes = match.group(2)
    if 'whitespace-nowrap' not in classes and 'whitespace-normal' not in classes:
        new_classes = classes + ' whitespace-nowrap'
        return f'{tag}className="{new_classes}"'
    return match.group(0)

pattern = re.compile(r'(<(?:th|td)\s+(?:[^>]*?\s+)?)className="([^"]+)"')

def add_class(match):
    tag_inner = match.group(1)
    rest = match.group(2) if match.group(2) else ''
    return f'<{tag_inner}{rest} className="whitespace-nowrap"'

pattern_no_class = re.compile(r'<(th|td)(\s+(?!.*?className)[^>]*)?>')

for path in components:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = pattern.sub(inject_class, content)
    new_content = pattern_no_class.sub(add_class, new_content)
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Injected whitespace-nowrap into {os.path.basename(path)} table cells!")

