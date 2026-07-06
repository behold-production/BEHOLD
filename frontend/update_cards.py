import sys
import re

file_path = '/Users/abhijith/Desktop/PROJECT/behold-aspire/frontend/src/features/booking/Services.jsx'
with open(file_path, 'r') as f:
    content = f.read()

old_chunk_start = "renderItem={(advisor) => ("
old_chunk_end = "                                        )}\n                                    </div>\n                                </div>\n                            </div>\n                        )}"

start_idx = content.find(old_chunk_start)
end_idx = content.find(old_chunk_end, start_idx) + len(old_chunk_end)

if start_idx == -1 or end_idx == -1:
    print(f"Could not find chunk boundaries. Start: {start_idx}, End: {end_idx}")
    sys.exit(1)

new_chunk = """renderItem={(advisor) => (
                            <div
                                key={advisor.id}
                                className="bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 w-full flex flex-col h-full"
                            >
                                {/* Image Container */}
                                <div className="relative w-full aspect-[4/3] bg-gray-100 shrink-0">
                                    {advisor.profilePic ? (
                                        <img src={advisor.profilePic} alt={advisor.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-black text-4xl text-brand border-b border-gray-100 bg-surface-50">
                                            {getInitials(advisor.name)}
                                        </div>
                                    )}
                                    {/* Floating pill for experience */}
                                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-white/20">
                                        <span className="text-[10px] font-bold text-[#163a44]">{advisor.hours >= 1000 ? '8+' : '5+'} Yrs Exp</span>
                                    </div>
                                </div>

                                {/* Content Container */}
                                <div className="p-6 flex flex-col flex-1">
                                    {/* Role Pill */}
                                    <div className="mb-4">
                                        <span className="inline-block bg-[#f4f8f9] text-[#163a44] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit">
                                            {advisor.role || 'CONSULTANT PSYCHOLOGIST'}
                                        </span>
                                    </div>

                                    {/* Name */}
                                    <h3 className="text-xl font-bold text-[#163a44] mb-1.5">{advisor.name}</h3>

                                    {/* Languages */}
                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-4">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                                        {advisor.lang || 'English, Malayalam'}
                                    </div>

                                    {/* Bio */}
                                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-1 mb-6">
                                        {advisor.bio || 'Professional consultant specializing in cognitive and behavioral assessments.'}
                                    </p>

                                    {/* CTA Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (onBookTherapist) {
                                                onBookTherapist(advisor.id);
                                            } else {
                                                window.spaNavigate('/booking');
                                            }
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="w-full py-3 rounded-[20px] border border-gray-200 bg-white text-[#163a44] font-bold text-xs flex justify-center items-center hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer mt-auto shadow-sm"
                                    >
                                        Book Consultation
                                    </button>
                                </div>
                            </div>
                        )}"""

content = content[:start_idx] + new_chunk + content[end_idx:]

with open(file_path, 'w') as f:
    f.write(content)

print("Replaced successfully!")
