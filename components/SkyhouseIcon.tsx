import React from 'react';

export const SkyhouseIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    // Container to manage aspect ratio if needed, but SVG viewBox handles it.
    // Default size 24 is small, so we rely on width/height props mapping to SVG width/height.
    // The original artboard is 200x240 (0.83 aspect ratio).
    <svg
        viewBox="0 0 200 240"
        width={size}
        height={size * 1.2}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ overflow: 'visible' }}
    >
        <style>
            {`
        @keyframes skyhouseBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes skyhouseRock {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        .skyhouse-bob { animation: skyhouseBob 4s ease-in-out infinite; }
        .skyhouse-rock { animation: skyhouseRock 6s ease-in-out infinite; transform-origin: 100px 140px; }
      `}
        </style>
        <defs>
            <linearGradient id="moonGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#f39c12" />
                <stop offset="100%" stopColor="#f1c40f" />
            </linearGradient>
        </defs>

        {/* ROTATION/TILT GROUP (Static constraint) */}
        <g transform="translate(100, 100) rotate(4) translate(-100, -100)">

            {/* BALLOONS (Wrapper for Entrance + Bobbing) */}
            <g>
                {/* Center Balloon (Accent - Muted Teal) */}
                <g className="skyhouse-bob" style={{ animationDelay: '0s' }}>
                    {/* S-Curve String */}
                    <path d="M100 35 Q 98 50, 100 70" stroke="#b2bec3" strokeWidth="0.3" fill="none" />
                    <circle cx="100" cy="35" r="14" fill="#5F9EA0" />
                </g>

                {/* Left Balloon (Foggy Grey) */}
                <g className="skyhouse-bob" style={{ animationDelay: '0.5s' }}>
                    <path d="M75 45 Q 85 60, 95 70" stroke="#b2bec3" strokeWidth="0.3" fill="none" />
                    <circle cx="75" cy="45" r="12" fill="#bdc3c7" />
                </g>

                {/* Right Balloon (Foggy Grey) */}
                <g className="skyhouse-bob" style={{ animationDelay: '1.2s' }}>
                    <path d="M125 45 Q 115 60, 105 70" stroke="#b2bec3" strokeWidth="0.3" fill="none" />
                    <circle cx="125" cy="45" r="12" fill="#bdc3c7" />
                </g>
            </g>

            {/* HOUSE GROUP */}
            <g transform="translate(76, 74)">
                <g>
                    {/* House Body */}
                    <rect x="0" y="24" width="48" height="32" fill="#dfe6e9" />
                    {/* House Roof */}
                    <path d="M0 24 L24 0 L48 24" fill="#2d3436" />
                    {/* Window (Smaller 10px, Warmer Orange-Yellow) */}
                    <rect x="19" y="35" width="10" height="10" fill="#ffa502" />
                </g>
            </g>

            {/* CRESCENT BASE */}
            {/* Sharper Tips, Raised slightly */}
            <g style={{ transformOrigin: '100px 140px' }}>
                <g className="skyhouse-rock">
                    {/* New Path: Sharper tips */}
                    <path d="M55 135 C 55 175, 145 175, 145 135 C 145 160, 55 160, 55 135" fill="url(#moonGrad)" />
                </g>
            </g>
        </g>

        {/* TEXT LOCKUP */}
        <text x="100" y="235" textAnchor="middle" fontFamily="'Outfit', sans-serif" fontWeight="600" fontSize="14" letterSpacing="8" fill="#2d3436">SKYHOUSE</text>
    </svg>
);
