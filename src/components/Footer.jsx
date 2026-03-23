import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="w-full py-20 px-8 border-t border-zinc-100 bg-surface">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-[1440px] mx-auto">
        <div className="md:col-span-1">
          <p className="text-4xl font-black text-black mb-4 uppercase tracking-tighter font-headline">
            ASSEMBLE
          </p>
          <p className="font-body text-xs tracking-widest uppercase text-zinc-400 leading-loose">
            The Digital Curator.<br />
            Every experience is a marquee occasion.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-black text-sm uppercase tracking-widest mb-6">Discovery</h4>
          <ul className="space-y-3 font-body text-xs tracking-widest uppercase">
            <li>
              <Link
                to="/"
                className="text-zinc-400 hover:text-black underline decoration-2 underline-offset-4 transition-all"
              >
                Explore
              </Link>
            </li>
            <li>
              <a
                href="#"
                className="text-zinc-400 hover:text-black underline decoration-2 underline-offset-4 transition-all"
              >
                Journal
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-zinc-400 hover:text-black underline decoration-2 underline-offset-4 transition-all"
              >
                Partners
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-black text-sm uppercase tracking-widest mb-6">Assistance</h4>
          <ul className="space-y-3 font-body text-xs tracking-widest uppercase">
            <li>
              <a
                href="#"
                className="text-zinc-400 hover:text-black underline decoration-2 underline-offset-4 transition-all"
              >
                Support
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-zinc-400 hover:text-black underline decoration-2 underline-offset-4 transition-all"
              >
                Legal
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-zinc-400 hover:text-black underline decoration-2 underline-offset-4 transition-all"
              >
                Terms
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-black text-sm uppercase tracking-widest mb-6">Social</h4>
          <ul className="space-y-3 font-body text-xs tracking-widest uppercase">
            <li>
              <a
                href="#"
                className="text-zinc-400 hover:text-black underline decoration-2 underline-offset-4 transition-all"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-zinc-400 hover:text-black underline decoration-2 underline-offset-4 transition-all"
              >
                Twitter
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-zinc-400 hover:text-black underline decoration-2 underline-offset-4 transition-all"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto mt-20 pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="font-body text-xs tracking-widest uppercase text-zinc-400">
          © 2024 ASSEMBLE. THE DIGITAL CURATOR.
        </p>
        <div className="flex gap-8">
          <span className="material-symbols-outlined text-zinc-400 hover:text-black cursor-pointer transition-colors">
            language
          </span>
          <span className="material-symbols-outlined text-zinc-400 hover:text-black cursor-pointer transition-colors">
            nightlight
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
