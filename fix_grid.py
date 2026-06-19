import os

path = r'd:\MERN\behold-aspire\frontend\src\components\users\StudentProfile.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('grid grid-cols-4 max-w-2xl mx-auto', 'grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto')
content = content.replace('className=\"mt-3 grid grid-cols-2 gap-2\"', 'className=\"mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2\"')
content = content.replace('className=\"grid grid-cols-3 gap-3\"', 'className=\"grid grid-cols-1 sm:grid-cols-3 gap-3\"')
content = content.replace('className=\"grid grid-cols-2 gap-2\"', 'className=\"grid grid-cols-1 sm:grid-cols-2 gap-2\"')
content = content.replace('className=\"grid grid-cols-2 gap-3\"', 'className=\"grid grid-cols-1 sm:grid-cols-2 gap-3\"')
content = content.replace('className=\"grid grid-cols-4 gap-2\"', 'className=\"grid grid-cols-2 sm:grid-cols-4 gap-2\"')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Replaced broken grid breakpoints')
