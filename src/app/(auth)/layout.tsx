export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1E] to-[#1E2441]" />
      <div className="relative z-10 w-full flex items-center justify-center">{children}</div>
    </div>
  );
}
