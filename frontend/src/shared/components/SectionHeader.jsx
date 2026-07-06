import React from 'react';

export default function SectionHeader({ subtitle, title, description }) {
    return (
        <div className="flex flex-col space-y-3 mb-10 w-full max-w-3xl mx-auto items-center text-center">
            {subtitle && (
                <span className="text-[#00E5FF] font-bold text-xs tracking-[0.2em] uppercase">
                    {subtitle}
                </span>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-slate-900 tracking-tight leading-tight">
                {title}
            </h2>
            {description && (
                <p className="text-gray-500 text-base leading-relaxed font-normal max-w-2xl mx-auto">
                    {description}
                </p>
            )}
        </div>
    );
}
