import re

filepath = 'frontend/src/features/booking/ServiceBooking.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace border-radius classes in ServiceBooking to match reference design
replacements = [
    # Card / Containers -> rounded-3xl / rounded-2xl
    ('rounded-\\[10px\\] shadow-square-light p-6 sm:p-8 md:p-12', 'rounded-3xl shadow-sm p-6 sm:p-8 md:p-12'),
    ('rounded-\\[10px\\] shadow-square-light p-6 sm:p-8 md:p-12 flex flex-col justify-between space-y-8 select-none group h-full transition-shadow duration-300 hover:shadow-square-hover', 'rounded-3xl shadow-sm p-6 sm:p-8 md:p-12 flex flex-col justify-between space-y-8 select-none group h-full transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(0,229,255,0.08)]'),
    ('rounded-\\[10px\\] shadow-square-light bg-white border-surface-200', 'rounded-3xl shadow-sm bg-white border-surface-200'),
    ('rounded-\\[10px\\] shadow-square-hover border-brand bg-brand/5', 'rounded-3xl shadow-sm border-brand bg-brand/5'),
    ('rounded-\\[10px\\] max-w-2xl mx-auto shadow-sm space-y-6 text-center', 'rounded-3xl max-w-2xl mx-auto shadow-sm space-y-6 text-center'),
    ('rounded-\\[10px\\] p-5 text-left space-y-4 shadow-sm', 'rounded-3xl p-5 text-left space-y-4 shadow-sm'),
    ('rounded-\\[10px\\] bg-surface-50 border border-surface-200 mt-2', 'rounded-2xl bg-surface-50 border border-surface-200 mt-2'),
    ('rounded-\\[10px\\] text-sm text-surface-600', 'rounded-2xl text-sm text-surface-600'),
    ('rounded-\\[10px\\] shadow-sm space-y-4 text-center', 'rounded-3xl shadow-sm space-y-4 text-center'),
    ('bg-surface-50 border border-surface-200 p-4 sm:p-5 space-y-3 rounded-\\[10px\\]', 'bg-surface-50 border border-surface-200 p-4 sm:p-5 space-y-3 rounded-2xl'),
    ('bg-white border border-surface-200 p-4 flex flex-col xl:flex-row xl:items-center gap-4 w-full rounded-\\[10px\\]', 'bg-white border border-surface-200 p-4 flex flex-col xl:flex-row xl:items-center gap-4 w-full rounded-2xl'),
    ('bg-surface-50 border border-surface-200 p-4 flex items-center justify-between gap-3 animate-in fade-in duration-300 shadow-sm rounded-\\[10px\\]', 'bg-surface-50 border border-surface-200 p-4 flex items-center justify-between gap-3 animate-in fade-in duration-300 shadow-sm rounded-2xl'),
    ('bg-transparent sm:bg-surface-50 border-0 sm:border border-surface-200 rounded-\\[10px\\]', 'bg-transparent sm:bg-surface-50 border-0 sm:border border-surface-200 rounded-2xl'),
    ('p-0 sm:p-4 bg-transparent sm:bg-surface-50 border-0 sm:border border-surface-200 rounded-\\[10px\\]', 'p-0 sm:p-4 bg-transparent sm:bg-surface-50 border-0 sm:border border-surface-200 rounded-2xl'),
    ('border-\\[2px\\] border-brand rounded-\\[10px\\] bg-white overflow-hidden', 'border-[2px] border-brand rounded-3xl bg-white overflow-hidden'),
    ('border border-surface-900 bg-surface-50 shadow-sm rounded-\\[10px\\]', 'border border-surface-900 bg-surface-50 shadow-sm rounded-2xl'),
    ('border-\\[2px\\] rounded-\\[10px\\] transition', 'border-[2px] rounded-2xl transition'),
    
    # Inputs -> rounded-xl
    ('rounded-\\[10px\\] outline-none', 'rounded-xl outline-none'),
    ('rounded-\\[10px\\] text-sm font-medium', 'rounded-xl text-sm font-medium'),
    ('rounded-\\[10px\\] text-sm font-normal', 'rounded-xl text-sm font-normal'),
    ('border rounded-\\[10px\\] text-sm font-medium', 'border rounded-xl text-sm font-medium'),
    ('border rounded-\\[10px\\] text-sm font-normal', 'border rounded-xl text-sm font-normal'),
    ('border rounded-\\[10px\\] outline-none', 'border rounded-xl outline-none'),
    ('input rounded-\\[10px\\]', 'input rounded-xl'),
    ('select rounded-\\[10px\\]', 'select rounded-xl'),
    
    # Buttons -> rounded-full
    ('rounded-\\[10px\\] hover:bg-black transition-colors text-center border-2 border-surface-900 cursor-pointer shadow-sm', 'rounded-full hover:bg-black transition-colors text-center border-2 border-surface-900 cursor-pointer shadow-sm'),
    ('rounded-\\[10px\\] hover:border-surface-900 hover:bg-surface-50 transition-colors text-center cursor-pointer shadow-none', 'rounded-full hover:border-surface-900 hover:bg-surface-50 transition-colors text-center cursor-pointer shadow-none'),
    ('rounded-\\[10px\\] hover:border-brand transition-colors cursor-pointer active:scale-\\[0.98\\]', 'rounded-full hover:border-brand transition-colors cursor-pointer active:scale-[0.98]'),
    ('rounded-\\[10px\\] transition cursor-pointer flex items-center justify-center border-none shadow-none whitespace-nowrap', 'rounded-full transition cursor-pointer flex items-center justify-center border-none shadow-none whitespace-nowrap'),
    ('rounded-\\[10px\\] transition cursor-pointer w-full sm:w-auto text-center border-none shadow-none', 'rounded-full transition cursor-pointer w-full sm:w-auto text-center border-none shadow-none'),
    ('rounded-\\[10px\\] transition cursor-pointer w-full sm:w-auto text-center', 'rounded-full transition cursor-pointer w-full sm:w-auto text-center'),
    ('rounded-\\[10px\\] cursor-pointer transition border-none shadow-none', 'rounded-full cursor-pointer transition border-none shadow-none'),
    ('rounded-\\[10px\\] flex items-center justify-center shrink-0 font-bold', 'rounded-lg flex items-center justify-center shrink-0 font-bold'),
    ('rounded-\\[10px\\] flex items-center justify-center shrink-0 font-semibold', 'rounded-lg flex items-center justify-center shrink-0 font-semibold'),
    ('rounded-\\[10px\\] flex items-center justify-center shrink-0 font-medium', 'rounded-lg flex items-center justify-center shrink-0 font-medium'),
    
    # Other miscellaneous rounded-[10px]
    ('rounded-\\[10px\\]', 'rounded-2xl')
]

for old, new in replacements:
    content = re.sub(old.replace('\\[', '\\[').replace('\\]', '\\]'), new, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("ServiceBooking updated successfully!")
