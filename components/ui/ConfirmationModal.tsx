"use client";

import { Fragment } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({ open, title, message, confirmText, cancelText, onConfirm, onCancel }: ConfirmationModalProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        {/* Fondo semitransparente */}
        <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md bg-white rounded-lg p-6">
                <DialogTitle className="text-lg font-medium text-gray-900">{title}</DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    {confirmText}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
