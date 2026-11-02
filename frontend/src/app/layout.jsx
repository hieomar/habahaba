import { Inter } from "next/font/google";
import { AuthProvider } from "@/auth/authContext";
import { NotificationProvider } from "@/auth/notificationContext";
import { RBACProvider } from "@/auth/rbacContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata = {
  title: "NASFAM IPC Grain Traceability System",
  description:
    "Official NASFAM Internal Platform for grain traceability, warehouse management and supply chain oversight.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force light mode on initial load
              document.documentElement.classList.remove('dark');
              document.documentElement.style.backgroundColor = '#ffffff';
              document.documentElement.style.colorScheme = 'light';
              localStorage.removeItem('gtms-theme-preference');
            `,
          }}
        />
      </head>
      <body className="h-full antialiased bg-white">
        <AuthProvider>
          <RBACProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </RBACProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
