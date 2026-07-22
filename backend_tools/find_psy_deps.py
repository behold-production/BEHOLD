import re

with open('/tmp/old_admin_dashboard.jsx', 'r') as f:
    content = f.read()

deps = ['handleGenerateResetToken', 'updatingPsyIds', 'handleTogglePsyActiveStatus', 
        'adminSearchQuery', 'setAdminSearchQuery', 'handleAdminAddressSearch', 
        'isAdminSearching', 'adminSearchResults', 'isAdminLocating', 'handleAdminDetectLocation']

for dep in deps:
    print(f"--- {dep} ---")
    # Match the definition
    match = re.search(rf'(const\s+{dep}\s*=\s*(async\s+)?\(.*?\)[\s\S]*?(?=\n\s*const|\n\s*return|\n\n))', content)
    if match:
        print(match.group(1)[:500])
    else:
        # Check for useState
        match2 = re.search(rf'const\s*\[\s*{dep}\s*,\s*.*?\]\s*=\s*useState\(.*?\);', content)
        if match2:
            print(match2.group(0))
        else:
            match3 = re.search(rf'const\s*\[\s*.*?,\s*{dep}\s*\]\s*=\s*useState\(.*?\);', content)
            if match3:
                print(match3.group(0))
            else:
                print("NOT FOUND")
