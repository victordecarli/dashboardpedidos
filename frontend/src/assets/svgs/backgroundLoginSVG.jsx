import * as React from 'react';

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
        animation: float 20s ease-in-out infinite alternate;
      }
      .pulse {
        animation: pulse 15s ease-in-out infinite;
        transform-origin: center;
      }
      .spin {
        transform-origin: center;
        animation: spin 60s linear infinite;
      }
      .line {
        stroke-dasharray: 300;
        stroke-dashoffset: 300;
        animation: dash 15s linear infinite;
        filter: drop-shadow(0 0 2px rgba(165, 180, 252, 0.5));
      }
      .line1 { animation-delay: 0s; }
      .line2 { animation-delay: -3s; }
      .line3 { animation-delay: -6s; }
      .line4 { animation-delay: -9s; }
      .line5 { animation-delay: -12s; }
      
      .float-slow {
        animation: float 30s ease-in-out infinite alternate;
      }
      
      .float-icon {
        animation: float-icon 8s ease-in-out infinite alternate;
      }
      
      .particle {
        animation: particle 20s linear infinite;
        filter: drop-shadow(0 0 1px rgba(165, 180, 252, 0.8));
      }
      .particle1 { animation-delay: 0s; }
      .particle2 { animation-delay: -5s; }
      .particle3 { animation-delay: -10s; }
      .particle4 { animation-delay: -15s; }

      .fadeIn {
        opacity: 0;
        animation: fadeIn 2s ease-out forwards;
      }
      
      .moveRight {
        animation: moveRight 25s linear infinite;
      }
      
      .rotateIcon {
        transform-origin: center;
        animation: rotateIcon 12s linear infinite;
      }

      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(100px); }
        100% { transform: translateY(-50px); }
      }
      
      @keyframes float-icon {
        0% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-20px) scale(1.05); }
        100% { transform: translateY(15px) scale(0.95); }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(0.95); opacity: 0.6; }
        50% { transform: scale(1.05); opacity: 0.9; }
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes rotateIcon {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes dash {
        0% { stroke-dashoffset: 300; }
        50% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: -300; }
      }
      
      @keyframes particle {
        0% { 
          transform: translateY(0) translateX(0); 
          opacity: 0;
        }
        5% { opacity: 0.8; }
        95% { opacity: 0.8; }
        100% { 
          transform: translateY(-800px) translateX(100px); 
          opacity: 0;
        }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes moveRight {
        0% { transform: translateX(-200px); }
        100% { transform: translateX(1200px); }
      }
    `}</style>

    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4338ca" />
        <stop offset="50%" stopColor="#4940e0" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>

      <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.9" />
        <stop offset="70%" stopColor="#4f46e5" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
      </radialGradient>

      <filter id="blur1" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="30" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="atop" />
      </filter>

      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      {/* Definindo o padrão de grid para as linhas */}
      <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.4" />
      </pattern>

      {/* Criando um símbolo de partícula para reutilizar */}
      <symbol id="particle" viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="5" fill="#a5b4fc">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
        </circle>
      </symbol>

      {/* Ícone de pacote/caixa */}
      <symbol id="package" viewBox="0 0 24 24">
        <path
          d="M3,3 L21,3 L21,21 L3,21 L3,3 Z M3,3 L12,12 L21,3 M12,12 L12,21"
          fill="none"
          stroke="#a5b4fc"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </symbol>

      {/* Ícone de carrinho de compras */}
      <symbol id="cart" viewBox="0 0 24 24">
        <path
          d="M1,1 L5,1 L8,16 L18,16 L20,6 L6,6 M18,21 C18,22.1 17.1,23 16,23 C14.9,23 14,22.1 14,21 C14,19.9 14.9,19 16,19 C17.1,19 18,19.9 18,21 Z M8,21 C8,22.1 7.1,23 6,23 C4.9,23 4,22.1 4,21 C4,19.9 4.9,19 6,19 C7.1,19 8,19.9 8,21 Z"
          fill="none"
          stroke="#a5b4fc"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </symbol>

      {/* Ícone de notificação */}
      <symbol id="notification" viewBox="0 0 24 24">
        <path
          d="M12,3 C16.4183,3 20,6.58172 20,11 L20,17 L4,17 L4,11 C4,6.58172 7.58172,3 12,3 Z M12,17 L12,21 M9,3 C7.5,1 4.5,1 3,3"
          fill="none"
          stroke="#a5b4fc"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </symbol>

      {/* Ícone de entrega */}
      <symbol id="delivery" viewBox="0 0 24 24">
        <path
          d="M3,12 L3,2 L14,2 L14,12 M3,12 L14,12 M14,7 L19,7 L21,9 L21,12 L14,12 M6,17 C6,18.1 5.1,19 4,19 C2.9,19 2,18.1 2,17 C2,15.9 2.9,15 4,15 C5.1,15 6,15.9 6,17 Z M20,17 C20,18.1 19.1,19 18,19 C16.9,19 16,18.1 16,17 C16,15.9 16.9,15 18,15 C19.1,15 20,15.9 20,17 Z"
          fill="none"
          stroke="#a5b4fc"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </symbol>

      {/* Ícone de pagamento */}
      <symbol id="payment" viewBox="0 0 24 24">
        <path
          d="M2,7 L22,7 L22,18 L2,18 L2,7 Z M2,10 L22,10 M6,14 L8,14"
          fill="none"
          stroke="#a5b4fc"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </symbol>
    </defs>

    {/* Fundo com gradiente */}
    <rect width="100%" height="100%" fill="url(#bgGradient)" />

    {/* Grid 3D animado */}
    <g className="spin" opacity="0.4">
      <rect width="100%" height="100%" fill="url(#grid)" />
    </g>

    {/* Círculos com blur para efeito de profundidade */}
    <g filter="url(#blur1)">
      <circle cx={294} cy={210} fill="#4f39f6" r={332} opacity="0.5" className="float" />
      <circle cx={191} cy={612} fill="#818cf8" r={232} opacity="0.4" className="float-slow" />
      <circle cx={777} cy={324} fill="#6a58f7" r={282} opacity="0.4" className="pulse" />
      <circle cx={617} cy={710} fill="#4f39f6" r={232} opacity="0.4" className="pulse" />
    </g>

    {/* Linhas 3D animadas */}
    <g>
      <path
        className="line line1"
        d="M100,300 Q400,150 900,400"
        fill="none"
        stroke="#818cf8"
        strokeWidth="2.5"
        strokeOpacity="0.8"
        strokeLinecap="round"
      />
      <path
        className="line line2"
        d="M100,500 Q500,300 900,600"
        fill="none"
        stroke="#818cf8"
        strokeWidth="2.5"
        strokeOpacity="0.8"
        strokeLinecap="round"
      />
      <path
        className="line line3"
        d="M300,100 Q500,400 300,800"
        fill="none"
        stroke="#818cf8"
        strokeWidth="2.5"
        strokeOpacity="0.8"
        strokeLinecap="round"
      />
      <path
        className="line line4"
        d="M700,100 Q500,500 700,800"
        fill="none"
        stroke="#a5b4fc"
        strokeWidth="2.5"
        strokeOpacity="0.8"
        strokeLinecap="round"
      />
      <path
        className="line line5"
        d="M100,700 Q400,600 900,200"
        fill="none"
        stroke="#a5b4fc"
        strokeWidth="2.5"
        strokeOpacity="0.8"
        strokeLinecap="round"
      />
    </g>

    {/* Partículas flutuantes */}
    <g>
      <use href="#particle" x="100" y="900" width="12" height="12" className="particle particle1" opacity="0.8" />
      <use href="#particle" x="300" y="900" width="16" height="16" className="particle particle2" opacity="0.9" />
      <use href="#particle" x="500" y="900" width="10" height="10" className="particle particle3" opacity="0.7" />
      <use href="#particle" x="700" y="900" width="14" height="14" className="particle particle4" opacity="0.8" />
      <use href="#particle" x="900" y="900" width="12" height="12" className="particle particle1" opacity="0.8" />
      <use href="#particle" x="200" y="900" width="8" height="8" className="particle particle3" opacity="0.6" />
      <use href="#particle" x="400" y="900" width="10" height="10" className="particle particle2" opacity="0.7" />
      <use href="#particle" x="600" y="900" width="12" height="12" className="particle particle4" opacity="0.8" />
      <use href="#particle" x="800" y="900" width="14" height="14" className="particle particle1" opacity="0.9" />
    </g>

    {/* Destaques circulares brilhantes */}
    <circle cx="200" cy="300" r="15" fill="#a5b4fc" filter="url(#glow)" className="pulse" opacity="0.9" />
    <circle cx="800" cy="400" r="10" fill="#a5b4fc" filter="url(#glow)" className="pulse" opacity="0.9" />
    <circle cx="600" cy="200" r="12" fill="#a5b4fc" filter="url(#glow)" className="pulse" opacity="0.9" />
    <circle cx="400" cy="700" r="8" fill="#a5b4fc" filter="url(#glow)" className="pulse" opacity="0.9" />

    {/* Reflexos suaves para maior profundidade */}
    <ellipse cx="500" cy="850" rx="600" ry="100" fill="url(#glowGradient)" opacity="0.1" />

    {/* Elementos de loja virtual de pedidos */}
    <g>
      {/* Carrinho de compras flutuante 1 */}
      <g className="float-icon fadeIn" style={{ animationDelay: '0.3s' }}>
        <use href="#cart" x="180" y="240" width="46" height="46" fill="#a5b4fc" filter="url(#glow)" opacity="0.9" />
        <circle cx="203" cy="240" r="25" fill="#4f46e5" opacity="0.15" />
      </g>

      {/* Pacote flutuante */}
      <g className="float-icon fadeIn" style={{ animationDelay: '0.6s' }}>
        <use href="#package" x="750" y="520" width="50" height="50" fill="#a5b4fc" filter="url(#glow)" opacity="0.9" />
        <circle cx="775" cy="545" r="28" fill="#4f46e5" opacity="0.15" />
      </g>

      {/* Entrega flutuante */}
      <g className="float-icon fadeIn" style={{ animationDelay: '0.9s' }}>
        <use href="#delivery" x="280" y="650" width="48" height="48" fill="#a5b4fc" filter="url(#glow)" opacity="0.9" />
        <circle cx="304" cy="674" r="26" fill="#4f46e5" opacity="0.15" />
      </g>

      {/* Notificação flutuante */}
      <g className="float-icon fadeIn" style={{ animationDelay: '1.2s' }}>
        <use
          href="#notification"
          x="650"
          y="150"
          width="42"
          height="42"
          fill="#a5b4fc"
          filter="url(#glow)"
          opacity="0.9"
        />
        <circle cx="671" cy="171" r="24" fill="#4f46e5" opacity="0.15" />
      </g>

      {/* Pagamento flutuante */}
      <g className="float-icon fadeIn" style={{ animationDelay: '1.5s' }}>
        <use href="#payment" x="450" y="340" width="44" height="44" fill="#a5b4fc" filter="url(#glow)" opacity="0.9" />
        <circle cx="472" cy="362" r="25" fill="#4f46e5" opacity="0.15" />
      </g>

      {/* Caminho de entrega animado com ícones */}
      <g className="moveRight" opacity="0.7" style={{ animationDelay: '-5s' }}>
        <use href="#package" x="0" y="420" width="32" height="32" fill="#a5b4fc" filter="url(#glow)" opacity="0.8" />
      </g>
      <g className="moveRight" opacity="0.7" style={{ animationDelay: '-12s' }}>
        <use
          href="#notification"
          x="0"
          y="480"
          width="28"
          height="28"
          fill="#a5b4fc"
          filter="url(#glow)"
          opacity="0.8"
        />
      </g>
      <g className="moveRight" opacity="0.7" style={{ animationDelay: '-18s' }}>
        <use href="#cart" x="0" y="530" width="30" height="30" fill="#a5b4fc" filter="url(#glow)" opacity="0.8" />
      </g>

      {/* Círculo com ícone rotativo */}
      <g className="fadeIn" style={{ animationDelay: '1.8s' }}>
        <circle cx="870" cy="650" r="40" fill="#4f46e5" opacity="0.2" />
        <g className="rotateIcon">
          <use
            href="#payment"
            x="846"
            y="626"
            width="48"
            height="48"
            fill="#a5b4fc"
            filter="url(#glow)"
            opacity="0.9"
          />
        </g>
      </g>
    </g>
  </svg>
);
