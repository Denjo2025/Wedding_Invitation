import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import ThreeBackground from './components/ThreeBackground';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzUbjv3o2urj8UdKqLlQVAB8KjWt539dWFAbyZDCm7MOFvM9K8hrxVkl3mGQ8wZ0ucxQg/exec";
const TARGET_DATE = new Date("2026-11-19T10:00:00").getTime();

function App() {
  const [view, setView] = useState('rsvp');
  const [guestName, setGuestName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [familyCount, setFamilyCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

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

  const launchConfetti = useCallback(() => {
    const colors = ['#F5E6C8', '#E8C97A', '#FFFDF8', '#C9A84C', '#F0E0B0'];
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
    if (!guestName.trim()) { alert("Please enter your name"); return; }
    await submitResponse(guestName, familyName, true, familyCount);
  };

  const submitNoResponse = async () => {
    if (!guestName.trim()) { alert("Please enter your name"); return; }
    const fullName = familyName ? `${guestName} (${familyName})` : guestName;
    await submitResponse(fullName, '', false, 0);
  };

  const formatNum = (n) => String(n).padStart(2, '0');

  const renderCountdown = () => (
    <div className="flex justify-center gap-2 xs:gap-3 max-w-[400px] mx-auto w-full">
      {[
        { value: countdown.days, label: 'DAY' },
        { value: countdown.hours, label: 'HOUR' },
        { value: countdown.mins, label: 'MIN' },
        { value: countdown.secs, label: 'SEC' }
      ].map((item, i) => (
        <div key={i} className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm py-3 px-1 flex-1 text-center min-w-[62px] xs:min-w-[68px]">
          <div className="text-[28px] xs:text-[34px] font-serif text-[#8B6914] leading-none mb-1">{formatNum(item.value)}</div>
          <div className="text-[8px] xs:text-[9px] uppercase tracking-widest text-[#888888]">{item.label}S</div>
        </div>
      ))}
    </div>
  );

  const WeddingPhoto = ({ src, alt, className = '' }) => (
    <div className={`photo-frame ${className}`} style={{ maxWidth: src === 'couple' ? '340px' : '180px', margin: src === 'couple' ? '20px auto' : '0 auto', background: 'transparent', boxShadow: 'none' }}>
      <img
        src={src === 'couple' ? '/couple.png' : src === 'groom' ? '/groom.jpeg' : '/bride.jpeg'}
        alt={alt}
        className="wedding-photo"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  );

  const renderFooter = () => (
    <div className="mt-12 pt-6 border-t border-[#E8D9B5]/40 text-center">
      <p className="font-serif italic text-sm text-[#888888]">#DimalWedsSoniya</p>
      <p className="text-[9px] uppercase tracking-widest text-[#AAAAAA] mt-1">Made with ♥</p>
    </div>
  );

  return (
    <>
      <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 relative z-10">

        {/* Card — border removed */}
        <div className="max-w-[600px] w-full bg-[#FFFDF8]/93 backdrop-blur-md rounded-3xl shadow-2xl p-6 xs:p-8 sm:p-12 text-center scale-in-animation">

          {view !== 'confirmation' && (
            <>
              {/* Hero Section */}
              <section className="pb-8">
                <p className="text-[9px] xs:text-[11px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-[#8B6914] font-semibold mb-5">✦ ──────── ✦ ──────── ✦</p>
                <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-[#8B6914] font-semibold mb-4">Joyfully Invite You To Celebrate</p>
                <h1 className="font-serif text-[42px] xs:text-[52px] mb-3 leading-tight text-[#1A1A1A]">Dimal & Soniya</h1>
                <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-[#888888] font-semibold mb-8">Together With Their Families</p>

                <div className="flex justify-center items-center gap-0 mb-8 max-w-[500px] mx-auto">
                  <div className="w-[42%] text-right pr-3">
                    <div className="font-serif text-[18px] xs:text-[24px] sm:text-[28px] leading-tight text-[#222222]">Joseph Chacko & Dolly Joseph</div>
                  </div>
                  <div className="w-[16%] relative flex justify-center items-center h-16">
                    <div className="w-px h-16 bg-[#C9A84C]"></div>
                    <span className="absolute text-[#8B6914] text-md xs:text-lg">✝</span>
                  </div>
                  <div className="w-[42%] text-left pl-3">
                    <div className="font-serif text-[18px] xs:text-[24px] sm:text-[28px] leading-tight text-[#222222]">Soy Thomas & Shyla Soy</div>
                  </div>
                </div>

                <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-[#888888] font-semibold mt-8 mb-4">Request the Pleasure of Your Company</p>
                <p className="font-serif text-[12px] xs:text-[13px] text-[#888888] italic max-w-[420px] mx-auto leading-relaxed">
                  "Two are better than one... a cord of three strands is not quickly broken."<br/>— Ecclesiastes 4:9–12
                </p>
              </section>

              {/* Couple Portrait */}
              <section className="py-6 border-t border-b border-[#E8D9B5]/40 my-6">
                <div className="text-center max-w-[320px] mx-auto">
                  <WeddingPhoto src="couple" alt="Dimal & Soniya Portrait" />
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#8B6914] mt-4 font-semibold">Dimal & Soniya</p>
                  <p className="font-serif italic text-[22px] text-[#1A1A1A] mt-0.5">The Groom & The Bride</p>
                </div>
              </section>

              {/* Date & Location */}
              <section className="py-6">
                <div className="flex justify-center gap-2 xs:gap-3 mb-6 max-w-[420px] mx-auto w-full">
                  <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-3 xs:p-4 flex-1 flex flex-col justify-center min-w-[80px]">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#888888] mb-1">NOVEMBER</p>
                    <p className="text-[12px] xs:text-sm text-[#1A1A1A] font-semibold leading-tight">2026, Thursday</p>
                  </div>
                  <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-4 xs:p-5 flex-none flex items-center justify-center min-w-[70px] xs:min-w-[90px]">
                    <p className="font-serif text-[48px] xs:text-[64px] text-[#8B6914] leading-none">19</p>
                  </div>
                  <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-3 xs:p-4 flex-1 flex flex-col justify-center min-w-[80px]">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#888888] mb-1">TIME</p>
                    <p className="text-[14px] xs:text-lg text-[#1A1A1A] font-semibold">10 AM</p>
                  </div>
                </div>

                <p className="text-[11px] xs:text-[12px] italic text-[#999999] mb-4">✦ ──── In the presence of God and their loved ones ──── ✦</p>
                <p className="font-serif text-[20px] xs:text-[22px] mb-1 text-[#8B6914] tracking-widest uppercase">St. Joseph Church</p>
                <p className="text-[13px] text-[#888888] font-serif">📍 Chempanoda, Perambra, Calicut</p>
                <a href="https://maps.app.goo.gl/dPBk7iywoCoFgGRv8" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-[11px] uppercase tracking-widest text-[#8B6914] border-b border-[#8B6914] font-semibold hover:text-[#C9A84C] hover:border-[#C9A84C] transition">
                  📍 Click for Church Location
                </a>
              </section>

              {/* Countdown */}
              <section className="py-6 border-t border-b border-[#E8D9B5]/40 my-6">
                <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-[#888888] font-semibold mb-5">Countdown to the Ceremony</p>
                {renderCountdown()}
              </section>

              {/* Three.js Scene */}
              <section className="py-6">
                <div 
                  className="photo-frame" 
                  style={{ 
                    maxWidth: '400px', 
                    margin: '20px auto', 
                    height: '560px', /* Ensure this is 560px, NOT 440px */
                    background: 'transparent', 
                    padding: '0', 
                    borderRadius: '18px' 
                  }}
                >
                  <ThreeBackground />
                </div>
                
                {/* Text quote moved up closer by removing any spacer divs in between */}
                <p className="font-serif text-[15px] italic text-[#8B6914] mt-6">
                  "And they lived, and loved, and built a life together."
                </p>
              </section>

              {/* RSVP Actions */}
              {view === 'rsvp' && (
                <section className="py-8">
                  <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-[#888888] font-semibold mb-6">Kindly Reply</p>
                  <div className="flex flex-wrap justify-center gap-4 max-w-[400px] mx-auto">
                    <button onClick={handleYes} className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-5 py-4 bg-[#FFFDF8] border border-[#C9A84C] hover:border-[#8B6914] rounded-xl cursor-pointer shadow-sm hover:shadow-md hover:bg-[#FDF8EC] transition active:scale-[0.98]">
                      <span className="text-base text-wedding-green">✓</span>
                      <span className="text-[13px] font-semibold text-[#1A1A1A]">Joyfully Accepts! 🎉</span>
                    </button>
                    <button onClick={handleNo} className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-5 py-4 bg-[#FFFDF8] border border-[#E8AAAA] hover:border-[#C24141] rounded-xl cursor-pointer shadow-sm hover:shadow-md hover:bg-[#FDF0F0] transition active:scale-[0.98]">
                      <span className="text-base text-[#C24141]">✗</span>
                      <span className="text-[13px] font-semibold text-[#1A1A1A]">Regretfully Declines</span>
                    </button>
                  </div>
                </section>
              )}
            </>
          )}

          {/* CONFIRMATION */}
          {view === 'confirmation' && (
            <div id="confirmation-flow" className="flex flex-col items-center">
              <h1 className="font-serif text-[38px] xs:text-[48px] mb-2 leading-tight text-[#1A1A1A]">We're Getting Married!</h1>
              <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-[#888888] font-semibold mb-6">DIMAL & SONIYA</p>
              <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-2xl p-6 mb-6 relative w-full max-w-[500px]">
                <span className="absolute top-2 left-4 text-[#8B6914] text-3xl font-serif">"</span>
                <p className="font-serif italic text-[16px] xs:text-[18px] py-4 text-[#222222] leading-relaxed">
                  Your Response has been received!<br/>We're so grateful to share this blessing with you.
                </p>
                <span className="absolute bottom-1 right-4 text-[#8B6914] text-3xl font-serif">"</span>
              </div>
              <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-5 text-left w-full max-w-[500px] shadow-sm">
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-[9px] uppercase tracking-widest text-[#888888] mb-1 font-semibold">Date</p>
                  <p className="font-serif text-base mb-0.5 text-[#1A1A1A] font-semibold">19 / November / 2026</p>
                  <p className="font-serif text-[15px] text-[#555555]">Ceremony Time: 10 AM</p>
                </div>
                <div className="hidden sm:block w-px bg-[#E8D9B5] self-stretch mx-1"></div>
                <hr className="sm:hidden border-t border-[#E8D9B5]/80 my-1 w-full" />
                <div className="flex-1">
                  <p className="text-[9px] uppercase tracking-widest text-[#888888] mb-1 font-semibold">Venue</p>
                  <p className="font-serif text-base mb-0.5 text-[#1A1A1A] font-semibold">St. Joseph Church</p>
                  <p className="font-serif text-[15px] text-[#555555] mb-2">Chempanoda, Perambra</p>
                  <a href="https://maps.app.goo.gl/dPBk7iywoCoFgGRv8" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#8B6914] border-b border-[#8B6914] font-semibold uppercase tracking-wider pb-0.5 hover:text-[#C9A84C] hover:border-[#C9A84C] transition inline-block">
                    📍 Click for Location
                  </a>
                </div>
              </div>
              <a href="tel:9995558877" className="w-full max-w-[500px] border border-[#8B6914] hover:bg-[#8B6914]/5 rounded-xl py-4 flex items-center justify-center font-serif text-[#1A1A1A] text-[16px] tracking-wide font-medium transition mb-8 shadow-sm">
                📞 CALL HOST: 999 555 8877
              </a>
              <div className="mt-4 border-t border-[#E8D9B5]/40 pt-8 w-full">
                <p className="text-[10px] xs:text-[12px] uppercase tracking-[0.2em] xs:tracking-[0.25em] text-[#888888] font-semibold mb-5">Countdown to the Ceremony</p>
                {renderCountdown()}
              </div>
            </div>
          )}

          {renderFooter()}
        </div>
      </div>

      {/* YES MODAL (Moved Outside the Card Wrapper!) */}
      {view === 'modal' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setView('rsvp')} />
          {/* Added max-h-[90vh] overflow-y-auto so the popup is scrollable if it is taller than the phone screen */}
          <div className="relative bg-[#FFFDF8] border border-[#E8D9B5] rounded-2xl shadow-2xl p-6 xs:p-8 max-w-[400px] w-full max-h-[90vh] overflow-y-auto text-center z-10 scale-in-animation">
            <button className="absolute top-4 right-5 bg-transparent border-none text-2xl text-neutral-400 cursor-pointer" onClick={() => setView('rsvp')}>&times;</button>
            <h2 className="font-serif text-[32px] xs:text-[36px] mb-2 text-[#1A1A1A]">Wonderful!</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-6">Your Response Details</p>
            <div className="text-left mb-4">
              <label className="text-[10px] uppercase tracking-widest text-[#888888] block mb-1.5 font-semibold">Your Name *</label>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Enter your name" className="w-full p-3 border border-[#E8D9B5] rounded-lg text-sm bg-white outline-none focus:border-[#8B6914] transition" />
            </div>
            <div className="text-left mb-4">
              <label className="text-[10px] uppercase tracking-widest text-[#888888] block mb-1.5 font-semibold">Family Name (Optional)</label>
              <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="e.g. Joseph, Family" className="w-full p-3 border border-[#E8D9B5] rounded-lg text-sm bg-white outline-none focus:border-[#8B6914] transition" />
            </div>
            <p className="font-serif italic text-xl my-4 text-[#222222]">How many family members will attend?</p>
            <div className="flex justify-center items-center gap-5 mb-5">
              <button onClick={() => adjustCount(-1)} className="w-9 h-9 rounded-full border border-[#C9A84C] bg-white text-xl flex items-center justify-center cursor-pointer transition hover:bg-neutral-50 active:scale-95">−</button>
              <div className="font-serif text-[28px] min-w-[40px] text-center text-[#1A1A1A] font-semibold">{familyCount}</div>
              <button onClick={() => adjustCount(1)} className="w-9 h-9 rounded-full border border-[#C9A84C] bg-white text-xl flex items-center justify-center cursor-pointer transition hover:bg-neutral-50 active:scale-95">+</button>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[#888888] mb-6">Including Yourself</p>
            <button onClick={handleSubmit} disabled={isSubmitting || !guestName.trim()} className="w-full py-4 px-6 bg-[#8B6914] hover:bg-[#C9A84C] disabled:bg-neutral-300 disabled:cursor-not-allowed text-white border-none rounded-xl text-[12px] font-semibold uppercase tracking-widest cursor-pointer shadow transition active:scale-[0.98] flex items-center justify-center gap-2">
              {isSubmitting ? (<><span className="spinner"></span><span>Submitting...</span></>) : (<span>Submit Response</span>)}
            </button>
            {error && <p className="text-[#cc4444] text-sm mt-3 font-serif">Something went wrong. Please try again.</p>}
          </div>
        </div>
      )}

      {/* NO MODAL (Moved Outside the Card Wrapper!) */}
      {view === 'no' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setView('rsvp')} />
          {/* Added max-h-[90vh] overflow-y-auto so the popup is scrollable if it is taller than the phone screen */}
          <div className="relative bg-[#FFFDF8] border border-[#E8D9B5] rounded-2xl shadow-2xl p-6 xs:p-8 max-w-[400px] w-full max-h-[90vh] overflow-y-auto text-center z-10 scale-in-animation">
            <button className="absolute top-4 right-5 bg-transparent border-none text-2xl text-neutral-400 cursor-pointer" onClick={() => setView('rsvp')}>&times;</button>
            <h2 className="font-serif text-[26px] xs:text-[28px] italic mb-2 text-[#1A1A1A]">We'll Keep You in Our Prayers!</h2>
            <p className="text-[#888888] mb-6 text-sm">Thank you for letting us know.</p>
            <div className="text-left mb-4">
              <label className="text-[10px] uppercase tracking-widest text-[#888888] block mb-1.5 font-semibold">Your Name *</label>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Enter your name" className="w-full p-3 border border-[#E8D9B5] rounded-lg text-sm bg-white outline-none focus:border-[#8B6914] transition" />
            </div>
            <div className="text-left mb-6">
              <label className="text-[10px] uppercase tracking-widest text-[#888888] block mb-1.5 font-semibold">Family Name (Optional)</label>
              <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="e.g. Joseph, Family" className="w-full p-3 border border-[#E8D9B5] rounded-lg text-sm bg-white outline-none focus:border-[#8B6914] transition" />
            </div>
            <button onClick={submitNoResponse} disabled={isSubmitting || !guestName.trim()} className="w-full py-4 px-6 bg-[#999999] hover:bg-[#777777] disabled:bg-neutral-300 disabled:cursor-not-allowed text-white border-none rounded-xl text-[12px] font-semibold uppercase tracking-widest cursor-pointer shadow transition active:scale-[0.98] flex items-center justify-center gap-2">
              {isSubmitting ? (<><span className="spinner"></span><span>Submitting...</span></>) : (<span>Confirm Decline</span>)}
            </button>
            {error && <p className="text-[#cc4444] text-sm mt-3 font-serif">Something went wrong. Please try again.</p>}
          </div>
        </div>
      )}
    </>
  );
}

export default App;