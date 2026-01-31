import React, { useMemo } from 'react';
import { ArrowLeft, Download, Printer, FileText } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShipment } from '../../context/ShipmentContext';

export function InvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getShipment } = useShipment();

  const shipment = getShipment(id);

  // Generate invoice data from shipment or mock if not found
  const invoiceData = useMemo(() => {
     if (shipment) {
         return {
             id: `INV-${shipment.id}`,
             date: shipment.date,
             dueDate: shipment.date,
             status: 'Paid',
             sender: {
                 name: shipment.sender.name,
                 address: `${shipment.sender.city}, India`,
                 email: `${shipment.sender.name.split(' ')[0].toLowerCase()}@example.com`
             },
             receiver: {
                 name: shipment.receiver.name,
                 address: `${shipment.receiver.city}, India`,
                 email: `${shipment.receiver.name.split(' ')[0].toLowerCase()}@example.com`
             },
             items: [
                 { description: `${shipment.type} Delivery Service`, quantity: 1, rate: parseFloat(shipment.cost) * 0.82, amount: parseFloat(shipment.cost) * 0.82 },
                 { description: 'GST (18%)', quantity: 1, rate: parseFloat(shipment.cost) * 0.18, amount: parseFloat(shipment.cost) * 0.18 }
             ],
             total: parseFloat(shipment.cost)
         };
     }
     
     // Fallback Mock Data
     return {
        id: id || 'INV-2025-001',
        date: 'Dec 20, 2025',
        dueDate: 'Dec 20, 2025',
        status: 'Paid',
        sender: { name: 'John Doe', address: '123 Main St, Mumbai, MH', email: 'john@example.com' },
        receiver: { name: 'Jane Smith', address: '456 Park Ave, Delhi, DL', email: 'jane@example.com' },
        items: [
          { description: 'Standard Delivery Service', quantity: 1, rate: 250.00, amount: 250.00 },
          { description: 'GST (18%)', quantity: 1, rate: 45.00, amount: 45.00 }
        ],
        total: 295.00
      };
  }, [shipment, id]);

  const handleBack = () => {
      navigate(-1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header Actions */}
      <div className="flex items-center justify-between print:hidden">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Invoice Header */}
        <div className="p-8 border-b border-slate-200 bg-slate-50/50">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">INVOICE</h1>
                <p className="text-slate-500">#{invoiceData.id}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-900 mb-1">ShipFast Courier</h2>
              <p className="text-slate-500 text-sm">123 Logistics Park, Mumbai</p>
              <p className="text-slate-500 text-sm">support@shipfast.com</p>
            </div>
          </div>
        </div>

        {/* Invoice Actions/Meta */}
        <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-sm font-medium text-slate-500 mb-1">Invoice Date</div>
            <div className="text-slate-900 font-semibold">{invoiceData.date}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500 mb-1">Due Date</div>
            <div className="text-slate-900 font-semibold">{invoiceData.dueDate}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500 mb-1">Status</div>
            <span className="inline-flex px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold border border-green-200">
              {invoiceData.status}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500 mb-1">Amount Due</div>
            <div className="text-slate-900 font-bold">₹{invoiceData.total.toFixed(2)}</div>
          </div>
        </div>

        <div className="border-t border-slate-200 mx-8"></div>

        {/* Addresses */}
        <div className="p-8 grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Bill To</h3>
            <div className="text-slate-900 font-bold text-lg mb-1">{invoiceData.receiver.name}</div>
            <div className="text-slate-600">{invoiceData.receiver.address}</div>
            <div className="text-slate-600">{invoiceData.receiver.email}</div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Bill From</h3>
            <div className="text-slate-900 font-bold text-lg mb-1">{invoiceData.sender.name}</div>
            <div className="text-slate-600">{invoiceData.sender.address}</div>
            <div className="text-slate-600">{invoiceData.sender.email}</div>
          </div>
        </div>

        {/* Line Items */}
        <div className="p-8 bg-slate-50/50">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 font-semibold text-slate-500 text-sm uppercase tracking-wider">Description</th>
                <th className="py-3 font-semibold text-slate-500 text-sm uppercase tracking-wider text-right">Qty</th>
                <th className="py-3 font-semibold text-slate-500 text-sm uppercase tracking-wider text-right">Rate</th>
                <th className="py-3 font-semibold text-slate-500 text-sm uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoiceData.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-4 text-slate-900">{item.description}</td>
                  <td className="py-4 text-right text-slate-600">{item.quantity}</td>
                  <td className="py-4 text-right text-slate-600">₹{item.rate.toFixed(2)}</td>
                  <td className="py-4 text-right text-slate-900 font-medium">₹{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="p-8 bg-slate-100 flex justify-end">
          <div className="w-full max-w-xs space-y-3">
             <div className="border-t border-slate-300 my-2"></div>
            <div className="flex justify-between text-lg font-bold text-slate-900">
              <span>Total</span>
              <span>₹{invoiceData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
