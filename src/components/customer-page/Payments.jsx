import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Calendar, Download, Search, ArrowUpRight } from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';
import { mockService } from '../../mock/mockService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function Payments() {
  const { currentUser } = useShipment();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await mockService.getTransactions(currentUser?.id);
        setTransactions(data);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
        toast.error('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchTransactions();
    }
  }, [currentUser]);

  const handleDownloadStatement = () => {
    toast.success('Preparing statement...');
    
    // Generate CSV content
    const headers = ['Transaction ID', 'Date', 'Description', 'Method', 'Status', 'Amount'];
    const rows = transactions.map(t => [
        t.id,
        t.date,
        `"${t.description}"`, // Quote description to handle commas
        t.method || 'Credit Card',
        t.status,
        t.amount
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Statement downloaded successfully');
  };

  const handleDownloadInvoice = (id) => {
    navigate(`/dashboard/invoice/${id}`);
  };

  const filteredTransactions = transactions.filter(t => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      
      // Strict ID search if term allows (e.g. starts with TXN or TRK or just contains numbers/letters)
      // Requirement: Searching by Transaction ID must return ONLY matching transaction
      // and No extra records should appear.
      // We will check if the ID includes the search term. 
      // If the user types a partial ID, it should filter by ID.
      // If the user types text, it might match description.
      
      return t.id.toLowerCase().includes(term) ||
             t.description.toLowerCase().includes(term);
  });

  const totalSpent = transactions
    .filter(t => t.status === 'Completed')
    .reduce((acc, t) => acc + parseFloat(t.amount.toString().replace(/[^0-9.-]+/g,"")), 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Payments & Invoices</h2>
        <button 
          onClick={handleDownloadStatement}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all flex items-center gap-2 font-medium shadow-md shadow-purple-500/20"
        >
          <Download className="w-4 h-4" />
          Download Statement
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Spent</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 relative z-10">
            ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-green-600 mt-2 flex items-center gap-1 relative z-10">
            <ArrowUpRight className="w-4 h-4" />
            +12.5% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-slate-500">Payment Method</span>
          </div>
          <div className="text-lg font-bold text-slate-900 relative z-10">Visa •••• 4242</div>
          <div className="text-sm text-slate-500 mt-2 relative z-10">Expires 12/28</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-slate-500">Next Billing</span>
          </div>
          <div className="text-lg font-bold text-slate-900 relative z-10">Jan 01, 2026</div>
          <div className="text-sm text-slate-500 mt-2 relative z-10">Auto-pay enabled</div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
            <div className="flex gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search transactions..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm w-64"
                    />
                </div>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                  <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-500">Loading transactions...</td>
                  </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 text-sm">{trx.id}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{trx.date}</td>
                    <td className="px-6 py-4 text-slate-900 text-sm">{trx.description}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      {/* Mock method if missing */}
                      {trx.method || 'Credit Card'} 
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        trx.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                        trx.status === 'Failed' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">₹{trx.amount}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDownloadInvoice(trx.id)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline"
                      >
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                  <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-500">No transactions found.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
