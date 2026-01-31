import React, { useState } from 'react';
import { MessageSquare, Plus, Send, Clock, CheckCircle2, AlertCircle, Search, Filter } from 'lucide-react';

export function SupportPage() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
  const [tickets, setTickets] = useState([
    {
      id: 'TKT-2025-001',
      subject: 'Delay in Shipment #SF123456',
      status: 'Open',
      priority: 'High',
      date: 'Dec 20, 2025',
      lastUpdate: '2 hours ago'
    },
    {
      id: 'TKT-2025-002',
      subject: 'Invoice Discrepancy',
      status: 'Resolved',
      priority: 'Medium',
      date: 'Dec 15, 2025',
      lastUpdate: 'Dec 16, 2025'
    },
    {
      id: 'TKT-2025-003',
      subject: 'Change Delivery Address',
      status: 'Closed',
      priority: 'Low',
      date: 'Dec 10, 2025',
      lastUpdate: 'Dec 11, 2025'
    }
  ]);

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Shipment Issue',
    message: '',
    priority: 'Medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const ticket = {
      id: `TKT-2026-${Math.floor(Math.random() * 1000)}`,
      subject: newTicket.subject,
      status: 'Open',
      priority: newTicket.priority,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastUpdate: 'Just now'
    };
    setTickets([ticket, ...tickets]);
    setActiveTab('list');
    setNewTicket({ subject: '', category: 'Shipment Issue', message: '', priority: 'Medium' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'Closed': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      case 'Low': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Support & Help Desk</h2>
          <p className="text-slate-500">Managing your support tickets and inquiries</p>
        </div>
        <button 
          onClick={() => setActiveTab('new')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md shadow-purple-500/20 font-medium"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'list' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    Your Tickets
                  </h3>
                   <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input type="text" placeholder="Search..." className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-48" />
                      </div>
                      <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                        <Filter className="w-4 h-4" />
                      </button>
                   </div>
               </div>
               <div className="divide-y divide-slate-100">
                 {tickets.map((ticket) => (
                   <div key={ticket.id} className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer">
                     <div className="flex items-start justify-between mb-2">
                       <div className="flex items-center gap-3">
                         <span className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">{ticket.subject}</span>
                         <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                         </span>
                       </div>
                       <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                       </span>
                     </div>
                     <div className="flex items-center gap-4 text-xs text-slate-500">
                       <span className="font-mono">{ticket.id}</span>
                       <span>•</span>
                       <span className="flex items-center gap-1">
                         <Clock className="w-3 h-3" />
                         Updated {ticket.lastUpdate}
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
               {tickets.length === 0 && (
                 <div className="p-12 text-center text-slate-500">
                   <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                   <p>No tickets found</p>
                 </div>
               )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-900">Create New Ticket</h3>
                  <button onClick={() => setActiveTab('list')} className="text-sm text-slate-500 hover:text-slate-900">Cancel</button>
               </div>
               <form onSubmit={handleSubmit} className="p-6 space-y-6">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Subject</label>
                      <input 
                        required
                        type="text" 
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="Brief description of the issue"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Category</label>
                      <select 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                      >
                        <option>Shipment Issue</option>
                        <option>Billing / Invoice</option>
                        <option>Account Support</option>
                        <option>Technical Issue</option>
                        <option>Other</option>
                      </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Priority</label>
                    <div className="flex gap-4">
                      {['Low', 'Medium', 'High'].map((p) => (
                        <label key={p} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="priority" 
                            value={p}
                            checked={newTicket.priority === p}
                            onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                            className="text-purple-600 focus:ring-purple-500" 
                          />
                          <span className="text-sm text-slate-600">{p}</span>
                        </label>
                      ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Message</label>
                    <textarea 
                      required
                      rows="5"
                      value={newTicket.message}
                      onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                      placeholder="Please provide details about your issue..."
                    ></textarea>
                 </div>

                 <div className="pt-4 flex justify-end">
                   <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors flex items-center gap-2">
                     <Send className="w-4 h-4" />
                     Submit Ticket
                   </button>
                 </div>
               </form>
            </div>
          )}
        </div>

        {/* Sidebar / Info */}
        <div className="space-y-6">
           <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
             <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
               <AlertCircle className="w-5 h-5" />
               Need Urgent Help?
             </h3>
             <p className="text-sm text-purple-800 mb-4">Our support team is available 24/7 for critical issues.</p>
             <div className="space-y-2">
               <div className="flex items-center gap-3 text-sm text-purple-900 font-medium bg-white/50 p-2 rounded-lg">
                 <span>📞</span> +91 1800-SHIP-FAST
               </div>
               <div className="flex items-center gap-3 text-sm text-purple-900 font-medium bg-white/50 p-2 rounded-lg">
                 <span>📧</span> urgent@shipfast.com
               </div>
             </div>
           </div>

           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-900 mb-4">FAQs</h3>
             <div className="space-y-4">
               <details className="group">
                 <summary className="flex items-center justify-between font-medium text-slate-700 cursor-pointer list-none text-sm group-hover:text-purple-600 transition-colors">
                   <span>How do I track my shipment?</span>
                   <span className="transition group-open:rotate-180">⌄</span>
                 </summary>
                 <p className="text-slate-500 text-sm mt-2 pl-4 border-l-2 border-purple-100">
                   You can track your shipment using the Tracking ID in the "My Shipments" section or the top search bar.
                 </p>
               </details>
               <details className="group">
                 <summary className="flex items-center justify-between font-medium text-slate-700 cursor-pointer list-none text-sm group-hover:text-purple-600 transition-colors">
                   <span>How to cancel a booking?</span>
                   <span className="transition group-open:rotate-180">⌄</span>
                 </summary>
                 <p className="text-slate-500 text-sm mt-2 pl-4 border-l-2 border-purple-100">
                   Bookings can be cancelled from the "My Shipments" page if the status is still "Pending" or "Booked".
                 </p>
               </details>
               <details className="group">
                 <summary className="flex items-center justify-between font-medium text-slate-700 cursor-pointer list-none text-sm group-hover:text-purple-600 transition-colors">
                   <span>Where is my invoice?</span>
                   <span className="transition group-open:rotate-180">⌄</span>
                 </summary>
                 <p className="text-slate-500 text-sm mt-2 pl-4 border-l-2 border-purple-100">
                   Invoices are available in the "Payments" section for all completed shipments.
                 </p>
               </details>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
