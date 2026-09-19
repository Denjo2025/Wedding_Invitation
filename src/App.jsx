import { useState, useEffect, useCallback, Fragment } from 'react';
import confetti from 'canvas-confetti';
import ThreeBackground from './components/ThreeBackground';
import Ornament from './components/Ornament';
import { wedding } from './weddingData';

const APPS_SCRIPT_URL = wedding.links.rsvpEndpoint;
const TARGET_DATE = new Date(wedding.event.iso).getTime();
const MAPS_URL = wedding.links.maps;

/* Each design reads in a different order so the four are structurally distinct. */
const SECTION_ORDER = {
  0: ['hero', 'ornament', 'portrait', 'countdown', 'date', 'rsvp'],
  1: ['hero', 'portrait', 'date', 'countdown', 'rsvp'],
  2: ['hero', 'ornament', 'portrait', 'date', 'countdown', 'rsvp'],
  3: ['hero', 'portrait', 'date', 'countdown', 'scene', 'rsvp']
};

const WeddingPhoto = ({ alt, className = '' }) => (
  <img
    src="/couple-cutout.png"
    alt={alt}
    className={`couple-cutout ${className}`}
  />
);

function App() {
  const { couple, groomParents, brideParents, event, venue, verses, text, rsvp, actions, confirmation, form, footer, host } = wedding;
  const cd = wedding.countdown;
  const [view, setView] = useState('rsvp');
  const [guestName, setGuestName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [familyCount, setFamilyCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [design] = useState(() => {
    const d = parseInt(document.documentElement.getAttribute('data-design') || '3', 10);
    return Number.isNaN(d) ? 3 : d;
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const diff = TARGET_DATE - now;
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };
    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [view]);

  const launchConfetti = useCallback(() => {
    const css = getComputedStyle(document.documentElement);
    const accent = css.getPropertyValue('--color-accent').trim() || '#8B6914';
    const accentLight = css.getPropertyValue('--color-accent-light').trim() || '#C9A84C';
    const cardBg = css.getPropertyValue('--color-card-bg').trim() || '#FFFDF8';
    const colors = [cardBg, accentLight, accent];
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999, origin: { y: 0.6 } };
    const randomInRange = (min, max) => Math.random() * (max - min) + min;
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) { clearInterval(interval); return; }
      const particleCount = 20 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        colors: [colors[Math.floor(Math.random() * colors.length)]],
        shapes: ['circle'],
        scalar: randomInRange(0.5, 1.2)
      });
    }, 250);
  }, []);

  const handleYes = () => {
    launchConfetti();
    setTimeout(() => { setView('modal'); }, 1000);
  };

  const handleNo = () => { setView('no'); };

  const adjustCount = (delta) => {
    setFamilyCount(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const submitResponse = async (name, familyNameInput, attending, count) => {
    const fullName = familyNameInput ? `${name} (${familyNameInput})` : name;
    const payload = {
      guestName: fullName,
      attending,
      familyCount: count,
      submittedAt: new Date().toISOString()
    };
    try {
      setIsSubmitting(true);
      setError(false);
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
      });
      setView('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!guestName.trim()) { alert(form.nameRequired); return; }
    await submitResponse(guestName, familyName, true, familyCount);
  };

  const submitNoResponse = async () => {
    if (!guestName.trim()) { alert(form.nameRequired); return; }
    const fullName = familyName ? `${guestName} (${familyName})` : guestName;
    await submitResponse(fullName, '', false, 0);
  };

  const formatNum = (n) => String(n).padStart(2, '0');

  const countdownItems = [
    { value: countdown.days, label: cd.units[0] },
    { value: countdown.hours, label: cd.units[1] },
    { value: countdown.mins, label: cd.units[2] },
    { value: countdown.secs, label: cd.units[3] }
  ];

  // Shared widget (classic styling) used inside the confirmation panel
  const countdownWidget = () => (
    <div className="flex justify-center gap-2 xs:gap-3 max-w-[400px] mx-auto w-full">
      {countdownItems.map((item, i) => (
        <div key={i} className="bg-card-bg border border-divider rounded-xl shadow-sm py-3 px-1 flex-1 text-center min-w-[62px] xs:min-w-[68px]">
          <div className="text-[28px] xs:text-[34px] font-serif text-accent leading-none mb-1">{formatNum(item.value)}</div>
          <div className="text-[8px] xs:text-[9px] uppercase tracking-widest text-muted">{item.label}S</div>
        </div>
      ))}
    </div>
  );

  /* ---------------- COUNTDOWN (a different treatment per design) ---------------- */

  const renderCountdown = () => {
    if (design === 0) {
      return (
        <section key="countdown" className="py-8">
          <p className="font-jost text-[9px] uppercase tracking-[0.45em] text-muted mb-5">{cd.titleMinimal}</p>
          <p className="font-jost text-[16px] xs:text-[19px] tracking-[0.12em] text-ink">
            {countdown.days}<span className="text-muted">D</span>
            <span className="text-divider mx-2">·</span>{formatNum(countdown.hours)}<span className="text-muted">H</span>
            <span className="text-divider mx-2">·</span>{formatNum(countdown.mins)}<span className="text-muted">M</span>
            <span className="text-divider mx-2">·</span>{formatNum(countdown.secs)}<span className="text-muted">S</span>
          </p>
        </section>
      );
    }
    if (design === 1) {
      return (
        <section key="countdown" className="py-8">
          <p className="font-raleway text-[10px] uppercase tracking-[0.3em] text-muted mb-5 font-medium">{cd.titleModern}</p>
          <div className="flex justify-center gap-2 max-w-[420px] mx-auto">
            {countdownItems.map((item, i) => (
              <div key={i} className="bg-accent text-white rounded-2xl py-3 px-1 flex-1 text-center min-w-[62px] xs:min-w-[68px]">
                <div className="font-playfair text-[26px] xs:text-[30px] leading-none mb-1">{formatNum(item.value)}</div>
                <div className="text-[8px] uppercase tracking-[0.2em] text-white/75">{item.label}S</div>
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (design === 2) {
      return (
        <section key="countdown" className="py-8">
          <div className="border border-accent/40 px-4 py-6 max-w-[460px] mx-auto">
            <p className="font-marcellus text-[11px] uppercase tracking-[0.3em] text-accent mb-5">{cd.titleTraditional}</p>
            <div className="flex justify-center gap-2">
              {countdownItems.map((item, i) => (
                <div key={i} className="border border-accent/40 bg-card-bg py-3 px-1 flex-1 text-center min-w-[58px] xs:min-w-[64px]">
                  <div className="font-marcellus text-[24px] xs:text-[28px] text-accent leading-none mb-1">{formatNum(item.value)}</div>
                  <div className="text-[8px] uppercase tracking-[0.2em] text-muted">{item.label}S</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }
    return (
      <section key="countdown" className="py-6 border-t border-b border-divider/40 my-6">
        <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-muted font-semibold mb-5">{cd.titleClassic}</p>
        {countdownWidget()}
      </section>
    );
  };

  /* ---------------- PORTRAIT (shape differs per design) ---------------- */

  const renderPortrait = () => {
    if (design === 0) {
      return (
        <section key="portrait" className="py-8 reveal">
          <div className="max-w-[190px] mx-auto">
            <WeddingPhoto alt={couple.together} className="grayscale-[30%] opacity-90" />
          </div>
          <p className="font-jost text-[9px] uppercase tracking-[0.45em] text-muted mt-6">{couple.togetherDot}</p>
        </section>
      );
    }
    if (design === 1) {
      return (
        <section key="portrait" className="pb-8 reveal">
          <div className="mx-auto w-[200px] xs:w-[230px] aspect-[3/4] rounded-t-full overflow-hidden border-4 border-accent-light/40 bg-accent/5 shadow-lg">
            <img src="/couple-cutout.png" alt={couple.together} className="w-full h-full object-cover object-top" />
          </div>
          <p className="font-raleway text-[10px] uppercase tracking-[0.3em] text-accent mt-5 font-medium">{text.brideGroom}</p>
        </section>
      );
    }
    if (design === 2) {
      return (
        <section key="portrait" className="py-4 reveal">
          <div className="relative mx-auto w-[220px] h-[220px]">
            <div className="absolute inset-0 rounded-full border border-accent/30"></div>
            <div className="absolute inset-[7px] rounded-full border-2 border-accent/50"></div>
            <div className="absolute inset-[15px] rounded-full overflow-hidden bg-accent/5">
              <img src="/couple-cutout.png" alt={couple.together} className="w-full h-full object-contain" />
            </div>
          </div>
          <p className="font-marcellus text-[13px] uppercase tracking-[0.3em] text-accent mt-5">{couple.together}</p>
        </section>
      );
    }
    return (
      <section key="portrait" className="py-6 border-t border-b border-divider/40 my-6 reveal">
        <div className="text-center mx-auto max-w-[300px]">
          <WeddingPhoto alt={`${couple.together} Portrait`} />
          <p className="text-[10px] uppercase tracking-[0.25em] text-accent mt-4 font-semibold">{couple.together}</p>
          <p className="font-serif italic text-[22px] text-ink mt-0.5">{text.groomBride}</p>
        </div>
      </section>
    );
  };

  /* ---------------- DATE & VENUE (layout differs per design) ---------------- */

  const renderDate = () => {
    const mapsLink = (
      <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="inline-block mt-5 text-[11px] uppercase tracking-widest text-accent border-b border-accent font-semibold hover:text-accent-light hover:border-accent-light transition">
        {actions.viewLocation}
      </a>
    );

    if (design === 0) {
      return (
        <section key="date" className="py-8 reveal">
          <p className="font-jost text-[11px] uppercase tracking-[0.35em] text-muted-strong">{event.datePlain}</p>
          <p className="font-jost text-[10px] uppercase tracking-[0.35em] text-muted mt-2">{event.timeLabel}</p>
          <p className="font-jost text-[15px] text-accent tracking-[0.2em] uppercase mt-5">{venue.name}</p>
          <p className="font-jost text-[10px] tracking-[0.2em] text-muted mt-2">{venue.address}</p>
          {mapsLink}
        </section>
      );
    }
    if (design === 1) {
      return (
        <section key="date" className="py-8 reveal">
          <div className="grid grid-cols-2 gap-3 max-w-[460px] mx-auto">
            <div className="bg-accent/5 border border-accent-light/40 rounded-2xl p-4 text-left">
              <p className="font-raleway text-[9px] uppercase tracking-[0.25em] text-accent mb-1 font-semibold">When</p>
              <p className="font-playfair text-[17px] text-ink">{event.dateCard}</p>
              <p className="text-[11px] text-muted mt-1">{event.timeInline}</p>
            </div>
            <div className="bg-accent/5 border border-accent-light/40 rounded-2xl p-4 text-left">
              <p className="font-raleway text-[9px] uppercase tracking-[0.25em] text-accent mb-1 font-semibold">Where</p>
              <p className="font-playfair text-[17px] text-ink">{venue.name}</p>
              <p className="text-[11px] text-muted mt-1">{venue.addressShort}</p>
            </div>
          </div>
          {mapsLink}
        </section>
      );
    }
    if (design === 2) {
      return (
        <section key="date" className="py-8 reveal">
          <div className="flex justify-center items-center gap-4 border-y border-accent/30 py-5 max-w-[460px] mx-auto">
            <div className="text-center">
              <p className="font-marcellus text-[10px] uppercase tracking-[0.25em] text-muted">{event.monthShort}</p>
              <p className="font-marcellus text-[34px] text-accent leading-none">{event.dayNum}</p>
              <p className="font-marcellus text-[10px] uppercase tracking-[0.25em] text-muted">{event.year}</p>
            </div>
            <div className="w-px h-14 bg-accent/30"></div>
            <div className="text-left">
              <p className="font-marcellus text-[16px] text-accent tracking-[0.15em] uppercase">{venue.name}</p>
              <p className="text-[11px] tracking-wide text-muted mt-1">{venue.address}</p>
              <p className="font-marcellus text-[11px] uppercase tracking-[0.2em] text-ink-soft mt-1">{event.time}</p>
            </div>
          </div>
          {mapsLink}
        </section>
      );
    }
    return (
      <section key="date" className="py-6 reveal">
        <div className="flex justify-center gap-2 xs:gap-3 mb-6 max-w-[420px] mx-auto w-full">
          <div className="bg-card-bg border border-divider rounded-xl shadow-sm p-3 xs:p-4 flex-1 flex flex-col justify-center min-w-[80px]">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted mb-1">{event.monthUpper}</p>
            <p className="text-[12px] xs:text-sm text-ink font-semibold leading-tight">{event.yearDay}</p>
          </div>
          <div className="bg-card-bg border border-divider rounded-xl shadow-sm p-4 xs:p-5 flex-none flex items-center justify-center min-w-[70px] xs:min-w-[90px]">
            <p className="font-serif text-[48px] xs:text-[64px] text-accent leading-none">{event.dayNum}</p>
          </div>
          <div className="bg-card-bg border border-divider rounded-xl shadow-sm p-3 xs:p-4 flex-1 flex flex-col justify-center min-w-[80px]">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted mb-1">TIME</p>
            <p className="text-[14px] xs:text-lg text-ink font-semibold">{event.time}</p>
          </div>
        </div>
        <p className="text-[11px] xs:text-[12px] italic text-muted-soft mb-4">{verses.presence}</p>
        <p className="font-serif text-[20px] xs:text-[22px] mb-1 text-accent tracking-widest uppercase">{venue.name}</p>
        <p className="text-[13px] text-muted font-serif">📍 {venue.address}</p>
        {mapsLink}
      </section>
    );
  };

  /* ---------------- THREE.JS SCENE (classic design only) ---------------- */

  const renderScene = () => (
    <section key="scene" className="py-6 reveal">
      <div className="photo-frame" style={{ maxWidth: '400px', margin: '20px auto', height: '560px', background: 'transparent', padding: '0', borderRadius: '18px' }}>
        <ThreeBackground />
      </div>
      <p className="font-serif text-[15px] italic text-accent mt-6">
        {verses.scene}
      </p>
    </section>
  );

  /* ---------------- RSVP (style differs per design) ---------------- */

  const renderRsvp = () => {
    if (design === 0) {
      return (
        <section key="rsvp" className="py-8 reveal">
          <p className="font-jost text-[9px] uppercase tracking-[0.45em] text-muted mb-6">{rsvp.heading}</p>
          <div className="flex flex-col gap-3 max-w-[320px] mx-auto">
            <button onClick={handleYes} className="font-jost text-[12px] uppercase tracking-[0.3em] py-4 bg-accent text-white border border-accent hover:bg-ink hover:border-ink transition cursor-pointer">{rsvp.accept}</button>
            <button onClick={handleNo} className="font-jost text-[12px] uppercase tracking-[0.3em] py-4 bg-transparent text-ink border border-muted-soft hover:border-ink hover:bg-accent/5 transition cursor-pointer">{rsvp.decline}</button>
          </div>
        </section>
      );
    }
    if (design === 1) {
      return (
        <section key="rsvp" className="py-8 reveal">
          <p className="font-raleway text-[10px] uppercase tracking-[0.3em] text-muted mb-6 font-medium">{rsvp.heading}</p>
          <div className="flex flex-wrap justify-center gap-3 max-w-[420px] mx-auto">
            <button onClick={handleYes} className="flex-1 min-w-[150px] px-6 py-4 bg-accent text-white rounded-full font-raleway text-[12px] font-semibold uppercase tracking-[0.2em] cursor-pointer hover:opacity-90 transition active:scale-[0.98]">{rsvp.accept}</button>
            <button onClick={handleNo} className="flex-1 min-w-[150px] px-6 py-4 border border-accent-light text-ink rounded-full font-raleway text-[12px] font-semibold uppercase tracking-[0.2em] cursor-pointer hover:bg-accent/5 transition active:scale-[0.98]">{rsvp.decline}</button>
          </div>
        </section>
      );
    }
    if (design === 2) {
      return (
        <section key="rsvp" className="py-8 reveal">
          <p className="font-marcellus text-[11px] uppercase tracking-[0.3em] text-accent mb-6">{rsvp.heading}</p>
          <div className="flex flex-wrap justify-center gap-3 max-w-[440px] mx-auto">
            <button onClick={handleYes} className="flex-1 min-w-[150px] px-5 py-4 bg-transparent border border-accent hover:bg-accent hover:text-white text-ink font-marcellus text-[12px] uppercase tracking-[0.2em] cursor-pointer transition active:scale-[0.98]">{rsvp.accept}</button>
            <button onClick={handleNo} className="flex-1 min-w-[150px] px-5 py-4 bg-transparent border border-muted-soft text-muted hover:text-ink font-marcellus text-[12px] uppercase tracking-[0.2em] cursor-pointer transition active:scale-[0.98]">{rsvp.decline}</button>
          </div>
        </section>
      );
    }
    return (
      <section key="rsvp" className="py-8 reveal">
        <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-muted font-semibold mb-6">{rsvp.heading}</p>
        <div className="flex flex-wrap justify-center gap-4 max-w-[400px] mx-auto">
          <button onClick={handleYes} className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-5 py-4 bg-card-bg border border-accent-light hover:border-accent rounded-xl cursor-pointer shadow-sm hover:shadow-md hover:bg-[#FDF8EC] transition active:scale-[0.98]">
            <span className="text-base text-wedding-green">✓</span>
            <span className="text-[13px] font-semibold text-ink">{rsvp.acceptClassic}</span>
          </button>
          <button onClick={handleNo} className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-5 py-4 bg-card-bg border border-[#E8AAAA] hover:border-[#C24141] rounded-xl cursor-pointer shadow-sm hover:shadow-md hover:bg-[#FDF0F0] transition active:scale-[0.98]">
            <span className="text-base text-[#C24141]">✗</span>
            <span className="text-[13px] font-semibold text-ink">{rsvp.decline}</span>
          </button>
        </div>
      </section>
    );
  };

  /* ---------------- BODY + SHELL ---------------- */

  const renderBody = () => {
    const pieces = {
      hero: <div key="hero">{renderHero()}</div>,
      ornament: design !== 3 ? (
        <div key="ornament" className="text-accent my-5">
          <Ornament design={design} />
        </div>
      ) : null,
      portrait: renderPortrait(),
      countdown: renderCountdown(),
      date: renderDate(),
      scene: renderScene(),
      rsvp: view === 'rsvp' ? renderRsvp() : null
    };
    const order = SECTION_ORDER[design] || SECTION_ORDER[3];
    return order.map((key) => pieces[key]).filter(Boolean);
  };

  const renderShell = (children) => {
    if (design === 0) {
      return (
        <div className="max-w-[560px] w-full text-center px-1 scale-in-animation">
          {children}
          {renderFooter()}
        </div>
      );
    }
    if (design === 1) {
      return (
        <div className="max-w-[620px] w-full bg-card-bg overflow-hidden shadow-2xl text-center scale-in-animation">
          <div className="bg-accent text-white py-7 px-6">
            <p className="font-playfair text-[24px] tracking-wide">{couple.initials}</p>
            <p className="font-raleway text-[9px] uppercase tracking-[0.35em] text-white/80 mt-1">{event.dateBand}</p>
          </div>
          <div className="p-6 xs:p-8 sm:p-10">
            {children}
            {renderFooter()}
          </div>
        </div>
      );
    }
    if (design === 2) {
      return (
        <div className="max-w-[600px] w-full bg-card-bg border-4 border-double border-accent p-2 shadow-2xl text-center scale-in-animation">
          <div className="border border-accent/35 px-5 py-8 xs:px-7 sm:px-10">
            {children}
            {renderFooter()}
          </div>
        </div>
      );
    }
    return (
      <div className="max-w-[600px] w-full bg-card-bg/93 backdrop-blur-md rounded-3xl shadow-2xl p-6 xs:p-8 sm:p-12 text-center scale-in-animation">
        {children}
        {renderFooter()}
      </div>
    );
  };

  const renderFooter = () => (
    <div className="mt-12 pt-6 border-t border-divider/40 text-center">
      <p className="font-serif italic text-sm text-muted">{footer.hashtag}</p>
      <p className="text-[9px] uppercase tracking-widest text-[#AAAAAA] mt-1">{footer.madeWith}</p>
    </div>
  );

  // Design 0 — Minimal (reference: stacked names, wide tracking)
  const renderHeroMinimal = () => (
    <section className="pb-8">
      <h1 className="font-jost font-light text-[30px] xs:text-[42px] tracking-[0.18em] text-ink leading-tight">{couple.groomUpper}</h1>
      <p className="font-jost text-[9px] uppercase tracking-[0.25em] text-muted mt-2">{groomParents.relation}</p>
      <p className="font-jost font-light text-[18px] text-accent my-3 tracking-[0.3em]">&amp;</p>
      <h1 className="font-jost font-light text-[30px] xs:text-[42px] tracking-[0.18em] text-ink leading-tight">{couple.brideUpper}</h1>
      <p className="font-jost text-[9px] uppercase tracking-[0.25em] text-muted mt-2">{brideParents.relation}</p>
      <p className="text-[10px] uppercase tracking-[0.35em] text-muted mt-8">{text.toCelebrate}</p>
      <div className="w-16 h-px bg-divider mx-auto my-6"></div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-strong">{event.dateDotted}</p>
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-strong mt-1">{event.timeLabel}</p>
      <p className="font-serif text-[18px] text-accent tracking-widest uppercase mt-6">{venue.name}</p>
      <p className="text-[11px] tracking-wide text-muted mt-1">{venue.address}</p>
    </section>
  );

  // Design 1 — Modern (reference: "Two souls, one beautiful journey")
  const renderHeroModern = () => (
    <section className="pb-8">
      <p className="font-playfair italic text-[15px] xs:text-[17px] text-accent mb-6">{verses.modern}</p>
      <p className="font-raleway text-[10px] uppercase tracking-[0.25em] text-muted font-medium">{text.withFamilies}</p>
      <p className="font-raleway text-[10px] uppercase tracking-[0.25em] text-muted font-medium mt-1">{text.inviteYou}</p>
      <p className="font-raleway text-[11px] uppercase tracking-[0.3em] text-accent font-medium mt-5">{text.weddingOf}</p>
      <h1 className="font-playfair text-[38px] xs:text-[50px] mt-3 mb-2 leading-tight text-ink">{couple.together}</h1>
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted">{text.twoHearts}</p>
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted mt-0.5">{text.lifetimeOfLove}</p>
      <p className="font-raleway text-[9px] uppercase tracking-[0.25em] text-muted font-medium mt-5">{groomParents.relation}</p>
      <p className="font-raleway text-[9px] uppercase tracking-[0.25em] text-muted font-medium mt-1">{brideParents.relation}</p>
      <div className="w-16 h-px bg-divider mx-auto my-6"></div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-strong">{event.dateLong}</p>
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-strong mt-1">{event.timeLabel}</p>
      <p className="font-serif text-[18px] text-accent tracking-widest uppercase mt-6">{venue.name}</p>
      <p className="text-[11px] tracking-wide text-muted mt-1">{venue.address}</p>
      <p className="font-serif italic text-[13px] text-muted mt-6 max-w-[420px] mx-auto leading-relaxed">{text.presenceNote}</p>
      <div className="flex flex-wrap justify-center gap-2 mt-5 text-[9px] uppercase tracking-[0.3em] text-ink font-semibold">
        {text.values.map((v, i) => (
          <Fragment key={v}>{i > 0 && <span className="text-accent">·</span>}<span>{v}</span></Fragment>
        ))}
      </div>
    </section>
  );

  // Design 2 — Traditional Kerala card (reference: Sacrament of Holy Matrimony)
  const renderHeroTraditional = () => (
    <section className="pb-8">
      <p className="font-serif text-[12px] xs:text-[13px] text-muted italic max-w-[440px] mx-auto leading-relaxed mb-8">
        {verses.main}<br/>{verses.mainRef}
      </p>

      <p className="font-serif text-[17px] xs:text-[20px] leading-tight text-ink-soft">{groomParents.names}</p>
      <p className="text-[11px] xs:text-[12px] tracking-wide text-muted mt-1 mb-4 leading-snug">({groomParents.addressInline})</p>
      <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-muted font-semibold max-w-[440px] mx-auto leading-relaxed">
        {text.requestHonor}
      </p>

      <h1 className="font-marcellus text-[38px] xs:text-[46px] mt-6 mb-1 leading-tight text-ink">{couple.groom}</h1>
      <p className="font-serif italic text-[16px] text-accent my-1">{text.weds}</p>
      <h1 className="font-marcellus text-[38px] xs:text-[46px] mb-6 leading-tight text-ink">{couple.bride}</h1>

      <p className="font-serif text-[17px] xs:text-[20px] leading-tight text-ink-soft">{brideParents.names}</p>
      <p className="text-[11px] xs:text-[12px] tracking-wide text-muted mt-1 mb-4 leading-snug">({brideParents.addressInline})</p>
      <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-muted font-semibold max-w-[440px] mx-auto leading-relaxed">
        {text.vow}
      </p>
    </section>
  );

  // Design 3 — Classic gold (original layout)
  const renderHeroClassic = () => (
    <section className="pb-8">
      <p className="text-[9px] xs:text-[11px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-accent font-semibold mb-5">✦ ──────── ✦ ──────── ✦</p>
      <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-accent font-semibold mb-4">{text.joyfullyInvite}</p>
      <h1 className="font-serif text-[42px] xs:text-[52px] mb-3 leading-tight text-ink">{couple.together}</h1>
      <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-muted font-semibold mb-8">{text.togetherFamilies}</p>

      <div className="flex justify-center items-center gap-0 mb-8 max-w-[500px] mx-auto">
        <div className="w-[42%] text-right pr-3">
          <div className="font-serif text-[15px] xs:text-[19px] sm:text-[23px] leading-tight text-ink-soft">{groomParents.namesShort}</div>
          <div className="text-[10px] xs:text-[11px] tracking-wide text-muted mt-1 leading-snug">{groomParents.addressLine1}<br/>{groomParents.addressLine2}</div>
        </div>
        <div className="w-[16%] relative flex justify-center items-center h-16">
          <div className="w-px h-16 bg-accent-light"></div>
          <span className="absolute text-accent text-md xs:text-lg">✝</span>
        </div>
        <div className="w-[42%] text-left pl-3">
          <div className="font-serif text-[15px] xs:text-[19px] sm:text-[23px] leading-tight text-ink-soft">{brideParents.namesShort}</div>
          <div className="text-[10px] xs:text-[11px] tracking-wide text-muted mt-1 leading-snug">{brideParents.addressLine1}<br/>{brideParents.addressLine2}</div>
        </div>
      </div>

      <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-muted font-semibold mt-8 mb-4">{text.requestPleasure}</p>
      <p className="font-serif text-[12px] xs:text-[13px] text-muted italic max-w-[420px] mx-auto leading-relaxed">
        {verses.classic}<br/>{verses.classicRef}
      </p>
    </section>
  );

  const renderHero = () => {
    if (design === 0) return renderHeroMinimal();
    if (design === 1) return renderHeroModern();
    if (design === 2) return renderHeroTraditional();
    return renderHeroClassic();
  };

  const renderConfirmation = () => (
    <div id="confirmation-flow" className="flex flex-col items-center">
      <h1 className="font-serif text-[38px] xs:text-[48px] mb-2 leading-tight text-ink">{confirmation.title}</h1>
      <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-muted font-semibold mb-6">{couple.togetherUpper}</p>
      <div className="bg-card-bg border border-divider rounded-2xl p-6 mb-6 relative w-full max-w-[500px]">
        <span className="absolute top-2 left-4 text-accent text-3xl font-serif">"</span>
        <p className="font-serif italic text-[16px] xs:text-[18px] py-4 text-ink-soft leading-relaxed">
          {confirmation.received}<br/>{confirmation.receivedSub}
        </p>
        <span className="absolute bottom-1 right-4 text-accent text-3xl font-serif">"</span>
      </div>
      <div className="bg-card-bg border border-divider rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-5 text-left w-full max-w-[500px] shadow-sm">
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-[9px] uppercase tracking-widest text-muted mb-1 font-semibold">{confirmation.dateLabel}</p>
          <p className="font-serif text-base mb-0.5 text-ink font-semibold">{event.dateSlash}</p>
          <p className="font-serif text-[15px] text-muted-strong">{confirmation.timeLabel}</p>
        </div>
        <div className="hidden sm:block w-px bg-divider self-stretch mx-1"></div>
        <hr className="sm:hidden border-t border-divider/80 my-1 w-full" />
        <div className="flex-1">
          <p className="text-[9px] uppercase tracking-widest text-muted mb-1 font-semibold">{confirmation.venueLabel}</p>
          <p className="font-serif text-base mb-0.5 text-ink font-semibold">{venue.name}</p>
          <p className="font-serif text-[15px] text-muted-strong mb-2">{venue.addressShort}</p>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="text-[11px] text-accent border-b border-accent font-semibold uppercase tracking-wider pb-0.5 hover:text-accent-light hover:border-accent-light transition inline-block">
            {actions.clickLocation}
          </a>
        </div>
      </div>
      <a href={`tel:${host.phone}`} className="w-full max-w-[500px] border border-accent hover:bg-accent/5 rounded-xl py-4 flex items-center justify-center font-serif text-ink text-[16px] tracking-wide font-medium transition mb-8 shadow-sm">
        {actions.callHost}
      </a>
      <div className="mt-4 border-t border-divider/40 pt-8 w-full">
        <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-muted font-semibold mb-5">{cd.titleClassic}</p>
        {countdownWidget()}
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 relative z-10">

        {renderShell(view === 'confirmation' ? renderConfirmation() : renderBody())}
      </div>

      {/* YES MODAL (Moved Outside the Card Wrapper!) */}
      {view === 'modal' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setView('rsvp')} />
          {/* Added max-h-[90vh] overflow-y-auto so the popup is scrollable if it is taller than the phone screen */}
          <div className="relative bg-card-bg border border-divider rounded-2xl shadow-2xl p-6 xs:p-8 max-w-[400px] w-full max-h-[90vh] overflow-y-auto text-center z-10 scale-in-animation">
            <button className="absolute top-4 right-5 bg-transparent border-none text-2xl text-neutral-400 cursor-pointer" onClick={() => setView('rsvp')}>&times;</button>
            <h2 className="font-serif text-[32px] xs:text-[36px] mb-2 text-ink">{form.yesTitle}</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-6">{form.yesSubtitle}</p>
            <div className="text-left mb-4">
              <label className="text-[10px] uppercase tracking-widest text-muted block mb-1.5 font-semibold">{form.nameLabel}</label>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder={form.namePlaceholder} className="w-full p-3 border border-divider rounded-lg text-sm bg-white outline-none focus:border-accent transition" />
            </div>
            <div className="text-left mb-4">
              <label className="text-[10px] uppercase tracking-widest text-muted block mb-1.5 font-semibold">{form.familyLabel}</label>
              <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder={form.familyPlaceholder} className="w-full p-3 border border-divider rounded-lg text-sm bg-white outline-none focus:border-accent transition" />
            </div>
            <p className="font-serif italic text-xl my-4 text-ink-soft">{form.countQuestion}</p>
            <div className="flex justify-center items-center gap-5 mb-5">
              <button onClick={() => adjustCount(-1)} className="w-9 h-9 rounded-full border border-accent-light bg-white text-xl flex items-center justify-center cursor-pointer transition hover:bg-neutral-50 active:scale-95">−</button>
              <div className="font-serif text-[28px] min-w-[40px] text-center text-ink font-semibold">{familyCount}</div>
              <button onClick={() => adjustCount(1)} className="w-9 h-9 rounded-full border border-accent-light bg-white text-xl flex items-center justify-center cursor-pointer transition hover:bg-neutral-50 active:scale-95">+</button>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted mb-6">{form.countNote}</p>
            <button onClick={handleSubmit} disabled={isSubmitting || !guestName.trim()} className="w-full py-4 px-6 bg-accent hover:bg-accent-light disabled:bg-neutral-300 disabled:cursor-not-allowed text-white border-none rounded-xl text-[12px] font-semibold uppercase tracking-widest cursor-pointer shadow transition active:scale-[0.98] flex items-center justify-center gap-2">
              {isSubmitting ? (<><span className="spinner"></span><span>{form.submitting}</span></>) : (<span>{form.submit}</span>)}
            </button>
            {error && <p className="text-[#cc4444] text-sm mt-3 font-serif">{form.error}</p>}
          </div>
        </div>
      )}

      {/* NO MODAL (Moved Outside the Card Wrapper!) */}
      {view === 'no' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setView('rsvp')} />
          {/* Added max-h-[90vh] overflow-y-auto so the popup is scrollable if it is taller than the phone screen */}
          <div className="relative bg-card-bg border border-divider rounded-2xl shadow-2xl p-6 xs:p-8 max-w-[400px] w-full max-h-[90vh] overflow-y-auto text-center z-10 scale-in-animation">
            <button className="absolute top-4 right-5 bg-transparent border-none text-2xl text-neutral-400 cursor-pointer" onClick={() => setView('rsvp')}>&times;</button>
            <h2 className="font-serif text-[26px] xs:text-[28px] italic mb-2 text-ink">{form.noTitle}</h2>
            <p className="text-muted mb-6 text-sm">{form.noSubtitle}</p>
            <div className="text-left mb-4">
              <label className="text-[10px] uppercase tracking-widest text-muted block mb-1.5 font-semibold">{form.nameLabel}</label>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder={form.namePlaceholder} className="w-full p-3 border border-divider rounded-lg text-sm bg-white outline-none focus:border-accent transition" />
            </div>
            <div className="text-left mb-6">
              <label className="text-[10px] uppercase tracking-widest text-muted block mb-1.5 font-semibold">{form.familyLabel}</label>
              <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder={form.familyPlaceholder} className="w-full p-3 border border-divider rounded-lg text-sm bg-white outline-none focus:border-accent transition" />
            </div>
            <button onClick={submitNoResponse} disabled={isSubmitting || !guestName.trim()} className="w-full py-4 px-6 bg-muted-soft hover:bg-[#777777] disabled:bg-neutral-300 disabled:cursor-not-allowed text-white border-none rounded-xl text-[12px] font-semibold uppercase tracking-widest cursor-pointer shadow transition active:scale-[0.98] flex items-center justify-center gap-2">
              {isSubmitting ? (<><span className="spinner"></span><span>{form.submitting}</span></>) : (<span>{form.decline}</span>)}
            </button>
            {error && <p className="text-[#cc4444] text-sm mt-3 font-serif">{form.error}</p>}
          </div>
        </div>
      )}
    </>
  );
}

export default App;