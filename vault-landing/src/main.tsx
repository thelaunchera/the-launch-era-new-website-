import { useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { X } from "lucide-react";
import { copy, objects, previews, projects } from "./content";
import { Portrait } from "./portrait";
import "./styles.css";

const lang = document.documentElement.lang === "es" ? "es" : "en";
const text = copy[lang];
const library = lang === "es" ? "/es/guias/biblioteca.html" : "/guias/library.html";
const otherLanding = lang === "es" ? "/guias/" : "/es/guias/";
const contact = library + "#contacto";
const edges = "rounded-[40px] sm:rounded-[50px] md:rounded-[60px]";
const heading = "text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight";
const pill = "inline-flex min-h-11 items-center justify-center rounded-full font-medium uppercase tracking-widest";

type FadeTag = "div" | "h2" | "li" | "nav";
const fadeTags = {
  div: motion.create("div"), h2: motion.create("h2"),
  li: motion.create("li"), nav: motion.create("nav"),
};

function FadeIn({ as = "div", children, className, delay = 0, duration = .7, x = 0, y = 30, label }:
  { as?: FadeTag; children: ReactNode; className?: string; delay?: number; duration?: number; x?: number; y?: number; label?: string }) {
  const Component = fadeTags[as];
  const reduced = useReducedMotion();
  return (
    <Component className={className} aria-label={label}
      initial={reduced ? false : { opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={reduced ? { duration: 0 } : { delay, duration, ease: [.25, .1, .25, 1] }}>
      {children}
    </Component>
  );
}

function ContactButton() {
  return <a href={contact} className={pill + " contact-btn px-8 py-3 text-xs text-white sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base"}>{text.contactMe}</a>;
}

function HeroSection() {
  return (
    <section className="landing-hero relative flex h-screen flex-col overflow-x-clip" aria-labelledby="hero-heading">
      <FadeIn as="nav" className="relative z-20 flex justify-between px-6 pt-6 md:px-10 md:pt-8" label={lang === "es" ? "Navegación principal" : "Primary navigation"} y={-20}>
        {[[text.about, "#about"], [text.price, "#price"], [text.navProjects, "#projects"], [text.contact, contact]].map(([label, href]) =>
          <a key={href} href={href} className="flex min-h-11 items-center text-sm font-medium uppercase tracking-wider transition-opacity duration-200 hover:opacity-70 md:text-lg lg:text-[1.4rem]">{label}</a>)}
      </FadeIn>
      <FadeIn className="mt-6 overflow-hidden sm:mt-4 md:-mt-5" delay={.15} y={40}>
        <h1 id="hero-heading" className="hero-heading w-full whitespace-nowrap text-center text-[14vw] font-black uppercase leading-none tracking-tight sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]">{text.title}</h1>
      </FadeIn>
      <Portrait />
      <div className="hero-bottom relative z-20 mt-auto flex items-end justify-between gap-4 px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
        <FadeIn className="max-w-[160px] sm:max-w-[220px] md:max-w-[260px]" delay={.35} y={20}>
          <p className="text-[clamp(.75rem,1.4vw,1.5rem)] font-light uppercase leading-snug tracking-wide">{text.intro}</p>
        </FadeIn>
        <FadeIn delay={.5} y={20}><ContactButton /></FadeIn>
      </div>
    </section>
  );
}

function MarqueeSection() {
  const section = useRef<HTMLElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [unavailable, setUnavailable] = useState<string[]>([]);
  useEffect(() => {
    const node = section.current, first = top.current, second = bottom.current;
    if (!node || !first || !second || reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = (window.innerHeight - node.getBoundingClientRect().top) * .3 - 200;
      first.style.transform = "translate3d(" + (offset - 433) + "px,0,0)";
      second.style.transform = "translate3d(" + (-offset - 433) + "px,0,0)";
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        update();
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", request);
      } else {
        window.removeEventListener("scroll", request);
        window.removeEventListener("resize", request);
      }
    }, { rootMargin: "300px" });
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  if (reduced) return null;
  const row = (images: string[], ref: typeof top) => {
    const available = images.filter(src => !unavailable.includes(src));
    return (
    <div ref={ref} className="flex w-max gap-3 will-change-transform">
      {[...available, ...available, ...available].map((src, index) => (
        <img key={index} src={src} alt="" width="420" height="270" loading="lazy" decoding="async" onError={() => setUnavailable(previous => previous.includes(src) ? previous : [...previous, src])} className="h-[270px] w-[420px] rounded-2xl object-cover" />
      ))}
    </div>
    );
  };
  return (
    <section ref={section} className="flex flex-col gap-3 overflow-hidden bg-[#0C0C0C] pb-10 pt-24 sm:pt-32 md:pt-40" aria-hidden="true">
      {row(previews.slice(0, 11), top)}
      {row(previews.slice(11), bottom)}
    </section>
  );
}

function Character({ char, progress, start, end }: { char: string; progress: MotionValue<number>; start: number; end: number }) {
  const opacity = useTransform(progress, [start, end], [.2, 1]);
  return <span className="relative"><span className="invisible">{char}</span><motion.span style={{ opacity }} className="absolute inset-0">{char}</motion.span></span>;
}

function AnimatedText({ children }: { children: string }) {
  const target = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start 0.8", "end 0.2"] });
  const words = children.split(" ");
  let index = 0;
  return (
    <p ref={target} className="max-w-[560px] text-center text-[clamp(1rem,2vw,1.35rem)] font-medium leading-relaxed">
      {reduced ? children : <>
        <span className="sr-only">{children}</span>
        <span aria-hidden="true">
          {words.map((word, wordIndex) => (
            <span key={wordIndex}><span className="inline-block whitespace-nowrap">{Array.from(word).map((char, charIndex) => {
              const start = index++ / children.length;
              return <Character key={charIndex} char={char} progress={scrollYProgress} start={start} end={Math.min(1, start + .08)} />;
            })}</span>{wordIndex < words.length - 1 ? " " : ""}</span>
          ))}
        </span>
      </>}
    </p>
  );
}

function AboutSection() {
  return (
    <section id="about" className="about-section relative isolate flex min-h-screen flex-col items-center justify-center gap-16 overflow-hidden px-5 py-20 sm:gap-20 sm:px-8 md:gap-24 md:px-10">
      {objects.map(({ src, className, x, delay }) => (
        <FadeIn key={src} className={"about-object pointer-events-none absolute -z-10 " + className} x={x} y={0} delay={delay} duration={.9}>
          <img src={src} alt="" loading="lazy" decoding="async" className="w-full" />
        </FadeIn>
      ))}
      <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
        <FadeIn as="h2" className={"hero-heading " + heading} y={40}>{text.aboutTitle}</FadeIn>
        <AnimatedText>{text.aboutText}</AnimatedText>
      </div>
      <FadeIn delay={.2}><ContactButton /></FadeIn>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="price" className="rounded-t-[40px] bg-white px-5 py-20 text-[#0C0C0C] sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32">
      <FadeIn as="h2" className={"mb-16 sm:mb-20 md:mb-28 " + heading}>{text.servicesTitle}</FadeIn>
      <ol className="mx-auto max-w-5xl divide-y divide-[#0c0c0c]/15">
        {text.services.map(([name, description], index) => (
          <FadeIn as="li" key={name} className="grid grid-cols-[auto_1fr] items-center gap-6 py-8 sm:gap-10 sm:py-10 md:gap-14 md:py-12" delay={index * .1}>
            <span className="project-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="text-[clamp(1rem,2.2vw,2.1rem)] font-medium uppercase">{name}</h3>
              <p className="max-w-2xl text-[clamp(.85rem,1.6vw,1.25rem)] font-light leading-relaxed opacity-60">{description}</p>
            </div>
          </FadeIn>
        ))}
      </ol>
    </section>
  );
}

type Project = typeof projects[number];

function ProjectPictures({ project, eager = false }: { project: Project; eager?: boolean }) {
  const imageClass = "h-full w-full bg-[#191919] object-cover " + edges;
  const img = (index: number, className = "") => (
    <img src={project.images[index]} alt={project.name + " — " + String(index + 1)} loading={eager ? "eager" : "lazy"} decoding="async" className={imageClass + " " + className} />
  );
  return (
    <div className="grid grid-cols-[2fr_3fr] gap-2 sm:gap-3">
      <div className="grid gap-2 sm:gap-3">
        {img(0, "project-image-top")}
        {img(1, "project-image-bottom")}
      </div>
      <div className="relative">{img(2, "absolute inset-0")}</div>
    </div>
  );
}

function LiveProjectButton({ open }: { open: () => void }) {
  return (
    <button onClick={open} className={pill + " border-2 border-[#D7E2EA] px-4 py-3 text-xs transition-colors hover:bg-[#D7E2EA]/10 sm:px-10 sm:py-3.5 sm:text-base"}>
      {text.liveProject}
    </button>
  );
}

function ProjectCard({ project, index, progress, open }: { project: Project; index: number; progress: MotionValue<number>; open: () => void }) {
  const reduced = useReducedMotion();
  const targetScale = 1 - (projects.length - 1 - index) * .03;
  const start = (index + 1) / (projects.length + 1);
  const scale = useTransform(progress, [start, start + .25], [1, targetScale]);
  return (
    <div className="project-slot pointer-events-none sticky" style={{ top: "calc(var(--stack-top) + " + (index * 28) + "px)" }}>
      <motion.article style={reduced ? undefined : { scale }} className={edges + " project-card pointer-events-auto origin-top border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-6 md:p-8"}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:mb-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-6">
            <span className="project-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-70 sm:text-sm">{project.category === "client" ? text.client : text.personal}</p>
              <h3 className="text-[clamp(1.1rem,3.4vw,3rem)] font-medium leading-tight">{project.name}</h3>
            </div>
          </div>
          <LiveProjectButton open={open} />
        </div>
        <ProjectPictures project={project} />
      </motion.article>
    </div>
  );
}

function ProjectsSection() {
  const stack = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<Project>();
  const { scrollYProgress } = useScroll({ target: stack, offset: ["start 0.8", "end end"] });
  useEffect(() => {
    if (active && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [active]);
  return (
    <section id="projects" className="relative z-10 -mt-10 rounded-t-[40px] bg-[#0C0C0C] px-5 pb-16 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 md:-mt-14 md:rounded-t-[60px] md:px-10">
      <FadeIn as="h2" className={"hero-heading mb-16 md:mb-24 " + heading}>{text.projectsTitle}</FadeIn>
      <div className="project-stack mx-auto max-w-[1240px]" ref={stack}>
        {projects.map((project, index) => <ProjectCard key={project.name} project={project} index={index} progress={scrollYProgress} open={() => setActive(project)} />)}
      </div>
      <dialog ref={dialog} aria-labelledby="project-dialog-title" onClose={() => setActive(undefined)}
        onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
        className={edges + " project-dialog border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 text-[#D7E2EA] sm:p-6"}>
        {active && (
          <div>
            <header className="mb-4 flex items-center justify-between gap-4">
              <h2 id="project-dialog-title" className="text-2xl font-medium sm:text-4xl">{active.name}</h2>
              <button type="button" className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-white/10" aria-label={text.close} onClick={() => dialog.current?.close()}><X size={22} aria-hidden="true" /></button>
            </header>
            <ProjectPictures project={active} eager />
          </div>
        )}
      </dialog>
    </section>
  );
}

function App() {
  return (
    <div className="landing min-h-screen overflow-x-clip bg-[#0C0C0C] text-[#D7E2EA]">
      <main>
        <HeroSection />
        <MarqueeSection />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
      </main>
      <footer className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 border-t border-white/15 px-6 py-5 sm:px-10">
        <a className="flex min-h-11 items-center hover:underline" href={library + "#guias"}>{text.library}</a>
        <a className="flex min-h-11 items-center px-2 hover:underline" href={otherLanding} hrefLang={lang === "es" ? "en" : "es"} lang={lang === "es" ? "en" : "es"}>{text.otherLanguage}</a>
      </footer>
    </div>
  );
}

flushSync(() => createRoot(document.getElementById("root")!).render(<App />));
