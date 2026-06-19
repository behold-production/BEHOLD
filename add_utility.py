import os

path = r'd:\MERN\behold-aspire\frontend\src\index.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

utility = '''
@utility shadow-deep-blue {
  box-shadow: 
    0 16px 40px rgba(10, 20, 60, 0.25),
    0 4px 12px rgba(10, 20, 60, 0.15);
}
'''

if '@utility shadow-deep-blue' not in content:
    with open(path, 'a', encoding='utf-8') as f:
        f.write(utility)
print('Added shadow-deep-blue utility')
