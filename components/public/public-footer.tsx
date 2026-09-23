export function PublicFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-gray-500 sm:flex-row sm:px-6">
        <p>&copy; {new Date().getFullYear()} राष्ट्रिय स्वतन्त्र पार्टी, चितवन। सबै अधिकार सुरक्षित।</p>
        <p>
          Developed By:{" "}
          <a
            href="https://www.techasdy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            TechAsdy
          </a>
        </p>
      </div>
    </footer>
  );
}
