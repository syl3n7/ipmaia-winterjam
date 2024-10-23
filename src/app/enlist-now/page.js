import Image from "next/image";

export default function Page() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <main className="flex flex-col gap-8 row-start-2 items-center">
            <nav>
    
            </nav>
            <Image
              className="dark:invert"
              src="/images/WinterJam_Logo.png"
              alt="WinterJam Logo!"
              width={180}
              height={38}
              priority
            />
            <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                <p>Welcome to winterjam, hosted by ipmaia!</p>
            </ol>
    
            <div className="flex gap-4 items-center flex-col sm:flex-row">
              <a
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                href="https://ipmaia-winterjam.pt/enlist-now"
                target="_blank"
                rel="noopener noreferrer"
              >
              Quero participar!
              </a>
              <a
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
                href="https://ipmaia-winterjam.pt/rules"
                target="_blank"
                rel="noopener noreferrer"
              >
                Regras e condições
              </a>
            </div>
          </main>

        </div>
      );
}