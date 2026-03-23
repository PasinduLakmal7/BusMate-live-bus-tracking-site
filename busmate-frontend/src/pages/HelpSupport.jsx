import React, { useState } from 'react';
import { MessageCircle, HelpCircle, Phone, Mail, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../components/common/Card';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';

const HelpSupport = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "How accurate is the live tracking?",
      a: "Our live tracking relies on GPS devices installed in the buses. It provides ETA accuracy within a 1-2 minute margin depending on sudden traffic fluctuations."
    },
    {
      q: "How is the crowd level calculated?",
      a: "Crowd levels are calculated using ticketing data, camera sensors (where available), and predictive AI models based on historical patterns."
    },
    {
      q: "Can I use the app without an internet connection?",
      a: "Yes! While live tracking requires internet, you can access saved routes, offline schedules, and your favorite stops without an active connection."
    },
    {
      q: "My bus is not showing on the map.",
      a: "This may happen if the bus's GPS tracker is temporarily offline or if you are viewing a route that doesn't currently have active dispatches. Try refreshing the live map."
    }
  ];

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight flex justify-center items-center gap-3 mb-4">
          <HelpCircle className="w-8 h-8 text-blue-600" /> Help & Support
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          Need assistance? Find answers to common questions or reach out to our team.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Support Options */}
        <Card hover className="p-6 text-center border-t-4 border-t-blue-500 flex flex-col items-center cursor-pointer">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-gray-50 text-lg mb-2">Live Chat Support</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Chat directly with our support team for immediate assistance.</p>
          <Button className="w-full mt-auto">Start Chat</Button>
        </Card>

        <Card hover className="p-6 text-center border-t-4 border-t-emerald-500 flex flex-col items-center cursor-pointer">
          <div className="bg-emerald-50 p-4 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-gray-50 text-lg mb-2">User Guides</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Learn how to maximize BusMate's features with step-by-step guides.</p>
          <Button variant="secondary" className="w-full mt-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50">View Documentation</Button>
        </Card>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* FAQ Section */}
        <div className="md:col-span-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card 
                key={i} 
                className="overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-600"
              >
                <button 
                  className="w-full p-4 flex justify-between items-center text-left focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-bold text-gray-900 dark:text-gray-50 text-sm sm:text-base pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-4 pt-0 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-800 mt-1">
                    {faq.a}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <Card className="p-6 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4">Send us a Message</h2>
            <form className="space-y-4">
              <InputField label="Name" placeholder="Your name" />
              <InputField label="Email Address" type="email" placeholder="you@example.com" />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea 
                  rows="4" 
                  className="block w-full rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 py-2.5 px-4 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <Button type="submit" className="w-full shadow-md">Submit Request</Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 text-blue-600" /> +94 11 234 5678
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 text-blue-600" /> support@busmate.lk
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
