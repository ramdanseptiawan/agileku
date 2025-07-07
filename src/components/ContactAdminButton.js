import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, X, ExternalLink } from 'lucide-react';

const ContactAdminButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const contactOptions = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        window.open('https://wa.me/6285255149256?text=Halo%20Admin%2C%20saya%20membutuhkan%20bantuan%20terkait%20kursus', '_blank');
      }
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => {
        window.location.href = 'mailto:ramdan.einstein@gmail.com?subject=Bantuan%20Kursus&body=Halo%20Admin%2C%0A%0ASaya%20membutuhkan%20bantuan%20terkait%3A%0A%0ATerima%20kasih.';
      }
    },
    {
      id: 'phone',
      label: 'Telepon',
      icon: Phone,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => {
        window.location.href = 'tel:+6285255149256';
      }
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Contact Options */}
      <div className={`fixed bottom-24 right-6 z-50 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="flex flex-col gap-3">
          {contactOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={option.action}
                className={`${option.color} text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 flex items-center gap-2 min-w-[48px] justify-center group`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isOpen ? 'slideInUp 0.3s ease-out forwards' : 'none'
                }}
                title={option.label}
              >
                <Icon size={20} />
                <span className="hidden group-hover:inline-block text-sm font-medium whitespace-nowrap">
                  {option.label}
                </span>
                <ExternalLink size={12} className="hidden group-hover:inline-block" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Contact Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-xl ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        title="Hubungi Admin"
      >
        {isOpen ? (
          <X size={24} className="transition-transform duration-300" />
        ) : (
          <MessageCircle size={24} className="transition-transform duration-300" />
        )}
      </button>

      {/* Floating label */}
      {!isOpen && (
        <div className="fixed bottom-6 right-20 z-40 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Butuh Bantuan?
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default ContactAdminButton;