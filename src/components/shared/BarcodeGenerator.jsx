import React from 'react';
import Barcode from 'react-barcode';

export function BarcodeGenerator({ value }) {
  if (!value) return null;

  return (
    <div className="flex flex-col items-center p-2 bg-white rounded-lg">
      <Barcode 
        value={value} 
        width={1.5}
        height={50}
        fontSize={14}
        background="#ffffff"
        lineColor="#000000"
      />
    </div>
  );
}
