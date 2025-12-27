import { useThemeContext } from '../themes/index.jsx';

const ToastContainer = ({ toasts }) => {
  const { currentTheme } = useThemeContext();
  const t = currentTheme.colors;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg ${t.textWhite} font-medium animate-slide-in max-w-sm ${
            toast.type === 'error' ? t.danger : t.success
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
