import re

files_to_fix_bg = [
    'src/features/landing/About.jsx',
    'src/features/landing/Faq.jsx',
    'src/features/landing/Inquiry.jsx',
    'src/features/booking/Services.jsx'
]

files_to_fix_uppercase = files_to_fix_bg + [
    'src/features/landing/Hero.jsx',
]

def remove_uppercase(content):
    # Regex to carefully remove uppercase and tracking-* classes
    content = re.sub(r'\buppercase\b\s*', '', content)
    content = re.sub(r'\btracking-widest\b\s*', '', content)
    content = re.sub(r'\btracking-wider\b\s*', '', content)
    content = re.sub(r'\btracking-wide\b\s*', '', content)
    # clean up multiple spaces in className strings
    content = re.sub(r' +', ' ', content)
    content = content.replace(' "', '"').replace('" ', '"')
    return content

for filepath in files_to_fix_uppercase:
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = remove_uppercase(content)
    
    if filepath in files_to_fix_bg:
        # Add the mobile background overlay div right after the opening <section ...> tag
        # The sections usually have <section id="..." className="...">
        bg_div = '\n      {/* Mobile Beautiful Background */}\n      <div className="absolute inset-0 z-0 bg-[url(\'/hero_clay.png\')] bg-cover bg-center opacity-30 md:hidden pointer-events-none"></div>'
        
        # we find the first <section> tag and insert bg_div inside it
        # find the end of the <section ...> tag
        match = re.search(r'<section[^>]+>', content)
        if match:
            end_pos = match.end()
            # check if it already has the overlay to avoid duplicates
            if "Mobile Beautiful Background" not in content:
                content = content[:end_pos] + bg_div + content[end_pos:]
        
    with open(filepath, 'w') as f:
        f.write(content)

print("Done")
