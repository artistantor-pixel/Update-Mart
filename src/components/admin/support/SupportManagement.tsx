"use client";

import { useEffect, useState } from 'react';
import { useSupportStore } from '@/store/supportStore';
import { MessageSquare, Phone, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function SupportManagement() {
  const { tickets, isLoading, fetchTickets, updateTicketStatus } = useSupportStore();
  const [filter, setFilter] = useState<'All' | 'Open' | 'Resolved'>('All');

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = tickets.filter(t => filter === 'All' || t.status === filter);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Support Tickets</h2>
          <p className="text-slate-500">Manage and resolve customer issues.</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-dark-800 p-1 rounded-xl">
          <button 
            onClick={() => setFilter('All')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'All' ? 'bg-white dark:bg-dark-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('Open')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'Open' ? 'bg-white dark:bg-dark-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
          >
            Open
          </button>
          <button 
            onClick={() => setFilter('Resolved')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'Resolved' ? 'bg-white dark:bg-dark-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 p-12 rounded-3xl border border-slate-200 dark:border-white/5 text-center flex flex-col items-center">
            <MessageSquare size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Tickets Found</h3>
            <p className="text-slate-500">You don't have any support tickets in this category.</p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div key={ticket.id} className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm group">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    {ticket.status === 'Open' ? (
                      <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
                        <Clock size={14} /> Open
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                        <CheckCircle size={14} /> Resolved
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-medium">
                      {format(new Date(ticket.created_at), 'PPp')}
                    </span>
                    {ticket.order_id && (
                      <span className="text-xs bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md font-mono">
                        {ticket.order_id}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{ticket.subject}</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{ticket.message}</p>
                  </div>
                </div>

                <div className="w-full md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/5 pt-4 md:pt-0 md:pl-6">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{ticket.customer_name}</p>
                    <a href={`tel:${ticket.customer_phone}`} className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-medium mt-1 hover:underline">
                      <Phone size={14} /> {ticket.customer_phone}
                    </a>
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-2">
                    {ticket.status === 'Open' && (
                      <>
                        <a 
                          href={`https://wa.me/88${ticket.customer_phone.replace(/[^0-9]/g, '')}?text=Hi ${encodeURIComponent(ticket.customer_name)}, we received your support ticket regarding "${encodeURIComponent(ticket.subject)}".`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full bg-[#25D366] text-white py-2 px-4 rounded-xl text-sm font-medium text-center hover:bg-[#20bd5a] transition-colors"
                        >
                          Reply on WhatsApp
                        </a>
                        <button 
                          onClick={() => updateTicketStatus(ticket.id, 'Resolved')}
                          className="w-full bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-300 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-500/10 dark:hover:text-green-400 py-2 px-4 rounded-xl text-sm font-medium transition-colors"
                        >
                          Mark as Resolved
                        </button>
                      </>
                    )}
                    {ticket.status === 'Resolved' && (
                       <button 
                       onClick={() => updateTicketStatus(ticket.id, 'Open')}
                       className="w-full bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10 dark:hover:text-amber-400 py-2 px-4 rounded-xl text-sm font-medium transition-colors"
                     >
                       Reopen Ticket
                     </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
