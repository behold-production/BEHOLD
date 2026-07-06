import os
import re

# Teal colors that were incorrectly applied — replace back with neon blue palette
REPLACEMENTS = [
    # Global brand colors in className strings
    ('#206173', '#00E5FF'),
    ('#163a44', '#0F172A'),
    ('#23949c', '#00cce6'),
    ('#eaf3f5', '#e6fbfb'),
    # Tailwind classes
    ('bg-\\[#206173\\]', 'bg-[#00E5FF]'),
    ('text-\\[#206173\\]', 'text-[#00E5FF]'),
    ('text-\\[#163a44\\]', 'text-[#0F172A]'),
    ('bg-\\[#163a44\\]', 'bg-[#0F172A]'),
    ('hover:bg-\\[#206173\\]', 'hover:bg-[#00cce6]'),
    ('shadow-\\[#163a44\\]', 'shadow-[#0F172A]'),
    ('from-\\[#23949c\\]', 'from-[#00E5FF]'),
    ('to-\\[#206173\\]', 'to-[#00cce6]'),
    # Text color references  
    ('text-\\[#206173\\]/10', 'text-[#00E5FF]/10'),
    ('bg-\\[#206173\\]/10', 'bg-[#00E5FF]/10'),
]

EXACT_REPLACEMENTS = [
    ('#206173', '#00E5FF'),
    ('#163a44', '#0F172A'),
    ('#23949c', '#00cce6'),
    ('#eaf3f5', '#e6fbfb'),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for old, new in EXACT_REPLACEMENTS:
        new_content = new_content.replace(old, new)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# Process all JSX and CSS files
for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.css') or file.endswith('.js'):
            process_file(os.path.join(root, file))

print("Done")
