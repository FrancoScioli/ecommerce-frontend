import "@/styles/globals.css";
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import CheckoutRedirectHandler from "@/components/CheckoutRedirectHandler";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "@/components/Footer";
import Script from "next/script";

export const metadata = {
  title: "E-Commerce",
  description: "Merchandising ecommerce page",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col antialiased bg-gray-50">
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartSidebar />
            <CheckoutRedirectHandler />
            <main className="flex-grow pt-20">
              {children}
              <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
              />
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
