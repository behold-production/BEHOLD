import re

with open('/tmp/old_admin_dashboard.jsx', 'r') as f:
    content = f.read()

# Extract Add/Edit Psy Modal
add_modal_match = re.search(r'\{\/\* 2\. PSYCHOLOGIST ADD / EDIT MODAL \*\/\}(.*?)\{\/\* 3\. BOOKING ADD / EDIT MODAL \*\/\}', content, re.DOTALL)
if add_modal_match:
    with open('/tmp/psy_add_modal.jsx', 'w') as f:
        f.write(add_modal_match.group(1).strip())

# Extract View Details Modal
view_modal_match = re.search(r'\{\/\* 6\. PSYCHOLOGIST VIEW DETAILS MODAL \*\/\}(.*?)\{\/\* 7\. SUB-ADMIN EDIT PERMISSIONS MODAL \*\/\}', content, re.DOTALL)
if view_modal_match:
    with open('/tmp/psy_view_modal.jsx', 'w') as f:
        f.write(view_modal_match.group(1).strip())

