import React from 'react';

export default function SectionHeader({ subtitle, title, description }) {
    return (
        <div className="flex flex-col space-y-3 mb-10 w-full max-w-3xl mx-auto items-center text-center">
            {subtitle && (
                <span className="text-[#0e7490] font-semibold text-[11px] tracking-[0.22em] uppercase">
                    {subtitle}
                </span>
            )}
            <h2 className="font-serif-hero text-3xl md:text-4xl lg:text-[42px] font-semibold text-[#0e1111] tracking-tight leading-tight">
                {title}
            </h2>
            {/* Classic ornament rule */}
            <span aria-hidden="true" className="inline-block w-12 h-px bg-[#c9c0ad] mx-auto my-1"></span>
            {description && (
                <p className="text-[#55605f] text-base leading-relaxed font-normal max-w-2xl mx-auto">
                    {description}
                </p>
            )}
        </div>
    );
}
