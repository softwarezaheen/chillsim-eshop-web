import React from "react";
import { Dialog } from "@headlessui/react";
import { Close } from "@mui/icons-material";

const ThemePreview = ({ isOpen, onClose, theme, colors }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute right-4 top-4">
            <Close className="w-6 h-6" />
          </button>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Preview</h3>
            <div className="space-y-8">
              {/* Navbar Preview */}
              <div className="rounded-lg overflow-hidden shadow-sm">
                <div
                  className="p-4"
                  style={{ backgroundColor: colors?.primary }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white text-lg font-semibold">
                      {theme?.name}
                    </span>
                    <div className="hidden sm:flex space-x-6">
                      <span className="text-white">Home</span>
                      <span className="text-white">About</span>
                      <span className="text-white">Services</span>
                      <span className="text-white">Contact</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="bg-white p-6 rounded-lg border">
                <h1
                  style={{ color: colors?.primary }}
                  className="text-2xl font-bold mb-4"
                >
                  Welcome to {theme?.name}
                </h1>
                <div className="prose max-w-none">
                  <p className="text-gray-600">
                    This is a preview of your theme's typography and colors. The
                    actual content will be customizable when you download the
                    theme.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: colors?.secondary }}
                    >
                      <span className="text-white">Secondary Color Block</span>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: colors?.accent }}
                    >
                      <span className="text-white">Accent Color Block</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Preview */}
              <div className="bg-gray-900 text-white p-6 rounded-lg">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">{theme?.name}</h3>
                    <p className="text-sm text-gray-400">
                      Your brand description will go here
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Quick Links</h3>
                    <div className="text-sm text-gray-400">
                      Home • About • Services • Contact
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ThemePreview;
