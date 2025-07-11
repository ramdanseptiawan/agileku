import React from 'react';

const Branding = ({ size = 'medium', showPoweredBy = true, className = '' }) => {
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16'
  };

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      {/* Main Logo */}
      <div className="flex items-center space-x-3">
        <img
          src="/mindshift.png"
          alt="Mindshift Learning"
          className={`${sizeClasses[size]} w-auto object-contain`}
        />
      </div>
      
      {/* Powered by Shinkai */}
      {showPoweredBy && (
        <div className="flex items-center space-x-2 opacity-75">
          <span className={`text-gray-600 ${
            size === 'small' ? 'text-xs' : 'text-sm'
          }`}>
           
          </span>
          <span className={`font-semibold text-gray-700 ${
            size === 'small' ? 'text-xs' : 'text-sm'
          }`}>
          </span>
        </div>
      )}
    </div>
  );
};

// Specific branding components for different use cases
export const FooterBranding = () => (
  <Branding size="small" className="py-4" />
);

export const HeaderBranding = () => (
  <Branding size="medium" showPoweredBy={false} />
);

export const LoadingBranding = () => (
  <div className="flex flex-col items-center space-y-4">
    <Branding size="large" />
    <div className="animate-pulse text-gray-500">Loading...</div>
  </div>
);

export default Branding;