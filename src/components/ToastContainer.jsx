const ToastContainer = ({ toasts }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {toasts.map(toast => (
      <div
        key={toast.id}
        className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium animate-slide-in max-w-sm ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        }`}
      >
        {toast.message}
      </div>
    ))}
  </div>
);

export default ToastContainer;
