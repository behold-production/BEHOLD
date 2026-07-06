import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace '\buppercase\b' with 'capitalize' but ONLY inside className="..." or className={`...`}
    # Actually, it's safe to just replace '\buppercase\b' with 'capitalize' everywhere in JSX if it's inside quotes or backticks,
    # but a simple regex '\buppercase\b' to 'capitalize' might replace things we don't want (like variable names if they exist, though unlikely to be just "uppercase").
    # Let's replace ' uppercase ' with ' capitalize ', 'uppercase ' with 'capitalize ', etc.
    
    # regex to match 'uppercase' as a whole word, but let's be careful.
    # it's usually in className strings.
    new_content = re.sub(r'\buppercase\b', 'capitalize', content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Done")
