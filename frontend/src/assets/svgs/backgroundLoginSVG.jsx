import * as React from "react";

export const BackgroundLoginSVG = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1024 960"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
    {...props}
  >
    {/* Animations */}
    <style>{`
      .float {
        animation: float 10s ease-in-out infinite alternate;
      }
      .pulse {
        animation: pulse 8s ease-in-out infinite;
        transform-origin: center;
      }

      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(300px); }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(3); opacity: 0.3; }
        50% { transform: scale(.75); opacity: 1; }
      }
    `}</style>

    <defs>
      <filter id="blur1" x="-10%" y="-10%" width="120%" height="120%">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feGaussianBlur stdDeviation={194} result="effect1_foregroundBlur" />
      </filter>
    </defs>

    <g filter="url(#blur1)">
      <circle cx={194} cy={210} fill="#4f39f6" r={432} className="float" />
      <circle cx={291} cy={612} fill="#4f39f6" r={432} className="float" />
      <circle cx={877} cy={224} fill="#6a58f7" r={432} className="pulse" />
      <circle cx={717} cy={910} fill="#4f39f6" r={432} className="pulse" />
      <circle cx={20} cy={41} fill="#4f39f6" r={432} className="pulse" />
      <circle cx={681} cy={121} fill="#6a58f7" r={432} className="pulse" />
    </g>
  </svg>
);
