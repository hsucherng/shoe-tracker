export function ContentWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="px-4 mx-auto max-w-320">{children}</div>;
}
