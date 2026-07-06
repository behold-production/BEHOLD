import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove 'capitalize' from className strings
    # We will replace '\bcapitalize\b' with '' (empty string)
    new_content = re.sub(r'\bcapitalize\b', '', content)
    # clean up double spaces that might be left behind
    new_content = re.sub(r'  +', ' ', new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Done")
