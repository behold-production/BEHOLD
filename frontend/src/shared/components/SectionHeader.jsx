import React from 'react';

export default function SectionHeader({ subtitle, title, description, align = 'center' }) {
    const isCenter = align === 'center';
    const alignClass = isCenter
        ? 'items-center text-center mx-auto'
        : 'items-start text-left';

    return (
        <div className={`flex flex-col space-y-3 mb-10 w-full max-w-3xl ${isCenter ? 'mx-auto items-center text-center' : 'items-start text-left'}`}>
            {subtitle && (
                <span className="text-[#206173] font-bold text-xs tracking-widest uppercase">
                    {subtitle}
                </span>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-[#163a44] tracking-tight leading-tight">
                {title}
            </h2>
            {description && (
                <p className="text-gray-500 text-sm sm:text-base max-w-2xl leading-relaxed">
                    {description}
                </p>
            )}
        </div>
    );
}
