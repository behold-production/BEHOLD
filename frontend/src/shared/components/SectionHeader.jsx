import React from 'react';

export default function SectionHeader({ subtitle, title, description, align = 'center' }) {
    // Force center alignment as requested
    const alignClass = 'items-center text-center mx-auto';
    
    return (
        <div className={`flex flex-col space-y-3 mb-10 w-full max-w-3xl ${alignClass}`}>
            {subtitle && (
                <span className="text-[#163a44] font-bold text-[12px] tracking-widest uppercase">
                    {subtitle}
                </span>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-[#163a44] tracking-tight leading-tight">
                {title}
            </h2>
            {description && (
                <p className="text-gray-500 font-medium text-sm sm:text-base px-4 max-w-2xl">
                    {description}
                </p>
            )}
        </div>
    );
}
