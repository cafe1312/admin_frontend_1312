import React from 'react';

export default function Spinner({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <span className="absolute font-serif text-sm font-bold text-cafeDark animate-pulse">1312</span>
        </div>
        <p className="mt-4 text-xs font-semibold text-cafeDark/50 tracking-widest uppercase animate-pulse">Brewing perfection...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-10 w-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin"></div>
    </div>
  );
}
