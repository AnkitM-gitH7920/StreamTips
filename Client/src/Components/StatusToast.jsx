import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import "../css/status-toast.css";

export default function StatusToast({ success, message, onClose, duration = 4500 }) {
     const [isClosing, setIsClosing] = useState(false);

     const handleClose = () => {
          setIsClosing(true);

          setTimeout(() => {
               onClose();
          }, 280);
     };

     useEffect(() => {
          if (!message || !duration) return;
          const timer = setTimeout(() => {
               handleClose()
          }, duration);
          return () => clearTimeout(timer);
     }, [message, duration, onClose]);

     if (!message) return null;

     return (
          <div className={`status-toast ${success ? "status-toast-success" : "status-toast-error"} ${isClosing ? "toast-closing" : ""}`}>
               <div className="status-toast-icon">
                    {success
                         ? <Check size={18} strokeWidth={3} />
                         : <X size={18} strokeWidth={3} />}
               </div>

               <p className="status-toast-message">{message}</p>

               <button
                    className="status-toast-close"
                    onClick={handleClose}
                    aria-label="Close notification"
               >
                    <X size={15} />
               </button>
          </div>
     );
}
