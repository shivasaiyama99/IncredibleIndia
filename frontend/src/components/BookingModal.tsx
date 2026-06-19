import { CheckCircle, X } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full text-center p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>
        
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 animate-pulse" />
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Trip Saved Successfully</h2>
        <p className="text-gray-600 mb-8">Your plan has been saved. You can view it in My Plans.</p>
        
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
        >
          Explore More
        </button>
      </div>
    </div>
  );
};

export default BookingModal;
