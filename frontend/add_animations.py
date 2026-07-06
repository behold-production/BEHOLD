import re

files = [
    'src/features/landing/About.jsx',
    'src/features/landing/Faq.jsx',
    'src/features/landing/Inquiry.jsx',
    'src/features/booking/Services.jsx',
    'src/features/student/CdatSection.jsx'
]

anim_props = ' initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }}'

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # ensure framer-motion is imported
    if "import { motion" not in content and "import { motion," not in content:
        if "import React" in content:
            content = content.replace("import React", "import { motion } from 'framer-motion';\nimport React")
        else:
            content = "import { motion } from 'framer-motion';\n" + content

    # replace <section ...> with <motion.section ... props>
    # only replace the first one that defines the main section container
    if '<section ' in content and 'initial={{' not in content:
        content = content.replace('<section ', '<motion.section ' + anim_props + ' ')
        content = content.replace('</section>', '</motion.section>')

    with open(filepath, 'w') as f:
        f.write(content)

print("Animations added")
