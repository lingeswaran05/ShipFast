import React, { useRef } from 'react';
import { Download } from 'lucide-react';

export function SectionDownloader({ children, title = "Download Section", className = "" }) {
  const sectionRef = useRef(null);

  const handleDownload = () => {
    // This uses the "Print to PDF" capability of the browser
    // functionality is achieved by temporarily manipulating the DOM to hide everything else
    if (!sectionRef.current) return;

    const originalContents = document.body.innerHTML;
    const printContents = sectionRef.current.innerHTML;
    
    // Create a temporary container for printing
    const printContainer = document.createElement('div');
    printContainer.innerHTML = printContents;
    printContainer.className = 'print-container';
    
    // Apply basic styles to ensuring it looks good
    // We are essentially replacing the body with just this content for a split second
    // A better approach often used in React is a separate media query, but this is a robust quick implementation
    
    // Actually, a safer way without destroying React state is to use a hidden iframe or specific CSS classes.
    // Let's use the CSS class toggling approach which doesn't unmount React components.
    
    document.body.classList.add('printing-mode');
    sectionRef.current.classList.add('print-visible');
    
    window.print();
    
    document.body.classList.remove('printing-mode');
    sectionRef.current.classList.remove('print-visible');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-end mb-2">
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
          title="Download this section"
        >
          <Download className="w-4 h-4" />
          {title}
        </button>
      </div>
      <div ref={sectionRef} className="print-section-content">
        {children}
      </div>
    </div>
  );
}
