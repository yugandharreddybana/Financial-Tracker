import React from "react";
import { AlertTriangle } from "lucide-react";
interface Props { isOpen:boolean; title:string; message:string; onConfirm:()=>void; onCancel:()=>void; }
const ConfirmDialog: React.FC<Props> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><AlertTriangle size={20} className="text-red-600" /></div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="btn-danger flex-1">Delete</button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmDialog;
