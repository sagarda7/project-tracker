export function PublicFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500 sm:px-6">
        <p>&copy; {new Date().getFullYear()} गुनासो प्रणाली। सबै अधिकार सुरक्षित।</p>
      </div>
    </footer>
  );
}
