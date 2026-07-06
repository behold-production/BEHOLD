import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all <button ... className="..." ... > and <Link ... className="..." ...> 
    # where className looks like a button
    
    # Actually, let's just find anything with className="... bg-brand ..." or "... bg-surface-900 ..."
    # and "rounded-X" and replace with "rounded-full"
    
    # A simpler approach: regex to replace rounded-[something] with rounded-full
    # inside any className that also has button-like classes like px-4 py-2, bg-brand, etc.
    # But wait, the user said "all the button corners round".
    # We can search for <button tags specifically.
    
    # Regex to find <button ... > tags
    button_pattern = re.compile(r'<button([^>]+)>', re.IGNORECASE)
    
    def replacer(match):
        inner = match.group(1)
        # replace rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-sm, rounded-[10px], rounded-[8px]
        # with rounded-full
        new_inner = re.sub(r'rounded-(?:sm|md|lg|xl|2xl|3xl|none|\[.*?\])', 'rounded-full', inner)
        
        # If it doesn't have rounded-full but has className, maybe we should add it?
        # Typically they already have a rounded-* class.
        return f'<button{new_inner}>'

    new_content = button_pattern.sub(replacer, content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Done")
