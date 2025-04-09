import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Modal({ onClose, title, children, redirecionarPara }) {
  const navigate = useNavigate();

  const handleClose = () => {
    if (redirecionarPara) {
      navigate(redirecionarPara);
    }
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = 'auto');
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative animate-slide-down">
        {/* Botão "X" */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xl font-bold"
          aria-label="Fechar"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>
        {children}
        <div className="mt-6 text-center">
          <button
            onClick={handleClose}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
