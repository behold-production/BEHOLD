import os

path = r'd:\MERN\behold-aspire\frontend\src\components\counsellors\PsychologistDashboard.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix grid breakpoints
content = content.replace('className="grid grid-cols-2 gap-3"', 'className="grid grid-cols-1 sm:grid-cols-2 gap-3"')
content = content.replace('className="grid grid-cols-2 gap-4 w-full sm:w-auto shrink-0 relative z-10 text-center"', 'className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-auto shrink-0 relative z-10 text-center"')

# Fix card shadows
content = content.replace('rounded-2xl shadow-2xl', 'rounded-2xl shadow-deep-blue')
content = content.replace('rounded-2xl shadow-xl', 'rounded-2xl shadow-deep-blue')
content = content.replace('rounded-2xl p-5 sm:p-8 shadow-md', 'rounded-2xl p-5 sm:p-8 shadow-deep-blue')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated PsychologistDashboard')
