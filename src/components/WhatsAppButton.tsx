export function WhatsAppButton() {
  return (
    <a
      href="https://wa.link/9snb09"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-[9999] transition-transform hover:scale-110 active:scale-95"
      aria-label="Falar no WhatsApp"
    >
      <img
        src="https://i.imgur.com/ryESuZ5.png"
        alt="WhatsApp"
        className="h-14 w-14 md:h-16 md:w-16"
      />
    </a>
  );
}
