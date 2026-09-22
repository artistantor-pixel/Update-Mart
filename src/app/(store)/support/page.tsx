"use client";

import { useState } from 'react';
import { Mail, Phone, MessageSquare, ChevronDown, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import { useSupportStore } from '@/store/supportStore';
import { useSettingsStore } from '@/store/settingsStore';
import Link from 'next/link';

const FAQS = [
  {
    question: "How long does delivery usually take?",
    answer: "For deliveries inside Dhaka, we aim for 24-48 hours. For outside Dhaka, it usually takes 3-5 business days depending on the courier service."
  },
  {
    question: "Do you offer Cash on Delivery (COD)?",
    answer: "Yes! We offer Cash on Delivery across Bangladesh. You can check the product first and then pay the delivery person."
  },
  {
    question: "How can I return or exchange a product?",
    answer: "If you receive a defective or incorrect product, please contact us within 24 hours of receiving the delivery. We will arrange a free return or exchange."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is processed and handed over to the courier, we will send you a tracking number via SMS or Email."
  }
];

export default function SupportPage() {
  const { footer } = useSettingsStore();
  const createTicket = useSupportStore((state) => state.createTicket);
  
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(e.currentTarget);
    const result = await createTicket({
      customer_name: formData.get('name') as string,
      customer_phone: formData.get('phone') as string,
      order_id: (formData.get('order_id') as string) || undefined,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    });

    setIsSubmitting(false);
    if (result.success) {
      setSubmitStatus('success');
      (e.target as HTMLFormElement).reset();
    } else {
      setSubmitStatus('error');
    }
  };

  const phone = footer?.phone || '+8801700000000';
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 pb-20">
      
      {/* Hero Section */}
      <div className="bg-primary-600 dark:bg-primary-900 pt-20 pb-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium">
            <MessageSquare size={16} /> 24/7 Support Center
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">How can we help you?</h1>
          <p className="text-primary-100 text-lg md:text-xl">Find answers to common questions or reach out to our team directly.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Contact Cards */}
          <Link href={whatsappUrl} target="_blank" className="bg-white dark:bg-dark-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle size={32} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">WhatsApp Chat</h3>
            <p className="text-slate-500 text-sm mb-4">Fastest way to get a reply. We usually respond within 5 minutes.</p>
            <span className="text-green-500 font-medium text-sm flex items-center gap-1 group-hover:underline">Chat Now &rarr;</span>
          </Link>

          <a href={`tel:${phone}`} className="bg-white dark:bg-dark-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Phone size={32} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Call Us</h3>
            <p className="text-slate-500 text-sm mb-4">Available from 10 AM to 8 PM, Saturday to Thursday.</p>
            <span className="text-blue-500 font-medium text-sm group-hover:underline">{phone}</span>
          </a>

          <a href={`mailto:${footer?.email || 'support@updatemart.com'}`} className="bg-white dark:bg-dark-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail size={32} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Email Us</h3>
            <p className="text-slate-500 text-sm mb-4">For business inquiries or detailed issue reports.</p>
            <span className="text-purple-500 font-medium text-sm group-hover:underline">{footer?.email || 'support@updatemart.com'}</span>
          </a>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-20">
          
          {/* FAQ Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Frequently Asked Questions</h2>
              <p className="text-slate-500">Quick answers to questions you might have.</p>
            </div>
            
            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4"
                  >
                    <span className="font-bold text-slate-900 dark:text-white">{faq.question}</span>
                    <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Form */}
          <div className="bg-white dark:bg-dark-800 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Submit a Ticket</h3>
            <p className="text-slate-500 mb-8">Can't find what you're looking for? Send us a message.</p>

            {submitStatus === 'success' ? (
              <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 p-6 rounded-2xl text-center">
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-green-700 dark:text-green-400 mb-2">Ticket Submitted!</h4>
                <p className="text-green-600 dark:text-green-500 text-sm">We have received your message and will get back to you shortly on your provided phone number.</p>
                <button onClick={() => setSubmitStatus('idle')} className="mt-6 text-green-700 dark:text-green-400 font-medium underline text-sm">Submit another ticket</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {submitStatus === 'error' && (
                  <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> Something went wrong. Please try again.
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Name *</label>
                    <input type="text" name="name" required className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number *</label>
                    <input type="tel" name="phone" required className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" placeholder="01XXXXXXXXX" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject *</label>
                    <input type="text" name="subject" required className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" placeholder="e.g. Defective Product" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Order ID <span className="font-normal text-slate-400">(Optional)</span></label>
                    <input type="text" name="order_id" className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" placeholder="ORD-123456" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message *</label>
                  <textarea name="message" required rows={4} className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none" placeholder="Please describe your issue in detail..."></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
                >
                  {isSubmitting ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Sending...</>
                  ) : (
                    'Submit Ticket'
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
