import './globals.css';

export const metadata = {
  title: 'Rhythm Bar Game',
  description: 'A rhythm-based game where you catch falling items',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
} 