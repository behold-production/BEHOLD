import os

path = r'd:\MERN\behold-aspire\frontend\src\components\admin\AdminDashboard.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Define the exact target block
target = '''                              {[...bookingsDb].reverse().slice(0, 3).map(b => (
                                <div key={b.id} className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-855 text-sm hover:border-zinc-800 transition-colors">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-2.5 flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <span className="font-bold text-white capitalize">{b.userName}</span>
                                        <span className="text-zinc-550 text-xs">booked with</span>
                                        <span className="font-bold text-brand capitalize">{b.advisorName}</span>
                                        <span className="text-xs bg-zinc-950 text-zinc-400 border border-zinc-850 px-2 py-0.5 rounded font-bold uppercase tracking-wider ml-1">
                                          {formatDateString(b.date)} • {b.time}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] bg-zinc-950 text-zinc-400 border border-zinc-850 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{b.mode}</span>
                                        <span className="text-[11px] bg-zinc-950 text-zinc-500 border border-zinc-850 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{b.service}</span>
                                        <span className={	ext-[11px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold border }>{b.status}</span>
                                      </div>
                                    </div>
                                    <div className="shrink-0 self-end sm:self-center">
                                      <button
                                        onClick={() => setSelectedOverviewBooking(selectedOverviewBooking === b.id ? null : b.id)}
                                        className="px-3.5 py-2 bg-zinc-955 hover:bg-zinc-900 border border-zinc-850 hover:border-brand/40 text-brand rounded-lg text-sm font-bold capitalize transition-colors cursor-pointer"
                                      >
                                        {selectedOverviewBooking === b.id ? 'Hide Details' : 'View Details'}
                                      </button>
                                    </div>
                                  </div>'''

# Define the replacement
replacement = '''                              {[...bookingsDb].reverse().slice(0, 3).map(b => (
                                <div key={b.id} className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-855 text-sm hover:border-zinc-800 transition-colors">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full relative z-10">
                                    <div className="space-y-3 w-full md:flex-1 md:min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-bold text-white capitalize shrink-0">{b.userName}</span>
                                        <span className="text-zinc-550 text-xs shrink-0">booked with</span>
                                        <span className="font-bold text-brand capitalize shrink-0">{b.advisorName}</span>
                                        <span className="text-xs bg-zinc-950 text-zinc-400 border border-zinc-850 px-2 py-1 rounded font-bold uppercase tracking-wider shrink-0 whitespace-nowrap mt-1 sm:mt-0">
                                          {formatDateString(b.date)} • {b.time}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[11px] bg-zinc-950 text-zinc-400 border border-zinc-850 px-2 py-1 rounded font-bold uppercase tracking-wider shrink-0 whitespace-nowrap">{b.mode}</span>
                                        <span className="text-[11px] bg-zinc-950 text-zinc-500 border border-zinc-850 px-2 py-1 rounded font-bold uppercase tracking-wider shrink-0 whitespace-nowrap">{b.service}</span>
                                        <span className={	ext-[11px] px-2 py-1 rounded uppercase tracking-wider font-bold border shrink-0 whitespace-nowrap }>{b.status}</span>
                                      </div>
                                    </div>
                                    <div className="w-full md:w-auto flex justify-start md:justify-end shrink-0 pt-2 md:pt-0">
                                      <button
                                        onClick={() => setSelectedOverviewBooking(selectedOverviewBooking === b.id ? null : b.id)}
                                        className="px-4 py-2 bg-zinc-955 hover:bg-zinc-900 border border-zinc-850 hover:border-brand/40 text-brand rounded-lg text-sm font-bold capitalize transition-colors cursor-pointer w-full md:w-auto shadow-sm relative z-20"
                                      >
                                        {selectedOverviewBooking === b.id ? 'Hide Details' : 'View Details'}
                                      </button>
                                    </div>
                                  </div>'''

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully replaced layout structure!")
else:
    print("Target block not found in file!")
