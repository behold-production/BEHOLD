import React from 'react';

export default function SectionHeader({ subtitle, title, description, align = 'center' }) {
    const alignClass = 
        align === 'center' ? 'items-center text-center mx-auto' : 
        align === 'responsive' ? 'items-center text-center mx-auto md:items-start md:text-left md:mx-0 md:pl-12 lg:pl-16' : 
        'items-start text-left';
    
    return (
        <div className={`flex flex-col space-y-3 mb-10 w-full max-w-3xl ${alignClass}`}>
            {subtitle && (
                <span className="text-[#163a44] font-normal text-[11px] tracking-widest uppercase">
                    {subtitle}
                </span>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#163a44] tracking-tight leading-tight">
                {title}
            </h2>
            {description && (
                <p className="text-gray-500 font-normal text-sm sm:text-base px-4">
                    {description}
                </p>
            )}
        </div>
    );
}
