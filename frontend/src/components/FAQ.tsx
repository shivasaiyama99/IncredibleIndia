import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: 'How can I book a destination?',
    a: 'You can explore destinations and click on “Explore Destination” to view details and booking options.',
  },
  {
    q: 'Do I need an account to use the wishlist?',
    a: 'Yes, please sign in to add destinations to your wishlist.',
  },
  {
    q: 'Can I cancel or change my booking?',
    a: 'Yes, cancellation and modification policies are available in the booking section.',
  },
  {
    q: 'Is the website accessible on mobile devices?',
    a: 'Yes, the site is fully responsive and works on all devices.',
  },
];

const AccordionItem: React.FC<{ item: FaqItem; index: number }> = ({ item, index }) => {
  const [open, setOpen] = useState(false);
  const id = `faq-item-${index}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between px-4 md:px-6 py-4 md:py-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-800">{item.q}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        id={id}
        className={`px-4 md:px-6 transition-all duration-300 ease-in-out ${open ? 'max-h-40 py-0 md:py-3 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden text-gray-600`}
      >
        {item.a}
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  return (
    <section id="faq" className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Frequently Asked <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about exploring destinations, wishlist, and bookings.
          </p>
        </div>

        <div className="space-y-4 md:space-y-5 max-w-3xl mx-auto">
          {faqs.map((item, i) => (
            <AccordionItem key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
