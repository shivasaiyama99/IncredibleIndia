import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  // Updated: Automatically close the notification after 1 second for instant, non-intrusive feedback
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1000); // 1000 milliseconds = 1 second

    // Cleanup the timer if the component is unmounted
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const Icon = isSuccess ? CheckCircle : XCircle;

  return (
    <div 
      className={`fixed top-5 right-5 z-[100] flex items-center p-4 rounded-lg shadow-lg text-white ${bgColor} animate-fade-in-down`}
    >
      <Icon className="w-6 h-6 mr-3" />
      <p className="font-medium">{message}</p>
    </div>
  );
};

export default Notification;
