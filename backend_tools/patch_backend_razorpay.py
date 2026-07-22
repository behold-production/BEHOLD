import os

# 1. Update Counsellor.js
counsellor_model = 'backend/src/models/Counsellor.js'
with open(counsellor_model, 'r') as f:
    content = f.read()
if 'razorpayAccountId:' in content:
    content = content.replace("    razorpayAccountId: { type: String, default: '' },\n", "")
    with open(counsellor_model, 'w') as f:
        f.write(content)
    print(f"Patched {counsellor_model}")

# 2. Update counsellorController.js
counsellor_controller = 'backend/src/controllers/counsellorController.js'
with open(counsellor_controller, 'r') as f:
    content = f.read()
if 'razorpayAccountId' in content:
    content = content.replace("        razorpayAccountId,\n", "")
    content = content.replace("      if (razorpayAccountId !== undefined) updates.razorpayAccountId = razorpayAccountId;\n", "")
    with open(counsellor_controller, 'w') as f:
        f.write(content)
    print(f"Patched {counsellor_controller}")

# 3. Update adminController.js
admin_controller = 'backend/src/controllers/adminController.js'
with open(admin_controller, 'r') as f:
    content = f.read()
if 'razorpayAccountId' in content:
    content = content.replace("        razorpayAccountId,\n", "")
    content = content.replace("      if (razorpayAccountId !== undefined) updates.razorpayAccountId = razorpayAccountId;\n", "")
    with open(admin_controller, 'w') as f:
        f.write(content)
    print(f"Patched {admin_controller}")

print("Backend patch complete.")
