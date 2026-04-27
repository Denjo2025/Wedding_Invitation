import { useState, useEffect, useCallback } from 'react'
import confetti from 'canvas-confetti'

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzUbjv3o2urj8UdKqLlQVAB8KjWt539dWFAbyZDCm7MOFvM9K8hrxVkl3mGQ8wZ0ucxQg/exec"
const TARGET_DATE = new Date("2026-11-19T10:00:00")

function App() {
  const [view, setView] = useState('rsvp')
  const [familyCount, setFamilyCount] = useState(1)
  const [guestName, setGuestName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const diff = TARGET_DATE - now
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 })
        return
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000)
      })
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  const launchConfetti = useCallback(() => {
    const colors = ['#F5E6C8', '#E8C97A', '#FFFDF8', '#C9A84C', '#F0E0B0']
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999, origin: { y: 0.6 } }
    const randomInRange = (min, max) => Math.random() * (max - min) + min
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) { clearInterval(interval); return }
      const particleCount = 20 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        colors: [colors[Math.floor(Math.random() * colors.length)]],
        shapes: ['circle'],
        scalar: randomInRange(0.5, 1.2)
      })
    }, 250)
  }, [])

  const handleYes = () => {
    launchConfetti()
    setTimeout(() => { setView('modal') }, 1000)
  }

  const handleNo = async () => {
    setView('no')
  }

  const submitNoResponse = async () => {
    const fullName = familyName ? `${guestName} (${familyName})` : guestName
    await submitResponse(fullName, '', false, 0)
  }

  const submitResponse = async (name, familyNameInput, attending, count) => {
    const fullName = familyNameInput ? `${name} (${familyNameInput})` : name
    const payload = { guestName: fullName, attending, familyCount: count, submittedAt: new Date().toISOString() }
    try {
      setIsSubmitting(true)
      await fetch(APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) })
      setView('confirmation')
    } catch { setError(true) }
    finally { setIsSubmitting(false) }
  }

  const handleSubmit = async () => {
    await submitResponse(guestName, familyName, true, familyCount)
  }

  const adjustCount = (delta) => {
    setFamilyCount(prev => Math.max(1, Math.min(10, prev + delta)))
  }

  const formatNum = (n) => String(n).padStart(2, '0')

  const renderCountdown = () => (
    <div className="flex justify-center gap-2.5">
      {[
        { value: countdown.days, label: 'DAY' },
        { value: countdown.hours, label: 'HOUR' },
        { value: countdown.mins, label: 'MIN' },
        { value: countdown.secs, label: 'SEC' }
      ].map((item, i) => (
        <div key={i} className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-3.5 min-w-[68px]">
          <div className="text-[36px] font-serif text-[#8B6914] leading-none mb-1">{formatNum(item.value)}</div>
          <div className="text-[9px] uppercase tracking-widest text-[#888888]">{item.label}S</div>
        </div>
      ))}
    </div>
  )

  const WeddingPhoto = ({ src, alt, caption, className = '' }) => (
    <div className={`photo-frame ${className}`} style={{ maxWidth: src === 'couple' ? '380px' : '180px', margin: src === 'couple' ? '40px auto' : '0 auto' }}>
      <img 
        src={src === 'couple' ? '/couple.jpeg' : src === 'groom' ? '/groom.jpeg' : '/bride.jpeg'} 
        alt={alt}
        className="wedding-photo"
        style={{ aspectRatio: src === 'couple' ? '4/5' : '3/4', width: '100%' }}
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Hero Section */}
      <section className="pt-24 pb-10">
        <div className="max-w-[600px] mx-auto px-5 text-center">
          <p className="text-[12px] uppercase tracking-[0.25em] text-[#8B6914] font-semibold mb-4">✦ ──────── ✦ ──────── ✦</p>
          <p className="text-[12px] uppercase tracking-[0.25em] text-[#8B6914] font-semibold mb-4">Joyfully Invite You To Celebrate</p>
          <h1 className="font-serif text-[52px] mb-3 leading-tight">Dimal & Soniya</h1>
          <p className="text-[12px] uppercase tracking-[0.25em] text-[#888888] font-semibold mb-7">Together With Their Families</p>

          <div className="flex justify-center items-start gap-0 mb-7">
            <div className="w-[42%] text-right pr-2">
              <div className="font-serif text-[28px]">Joseph Chacko</div>
              <div className="font-serif text-2xl">& Dolly Joseph</div>
            </div>
            <div className="w-[16%] relative">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-20 bg-[#C9A84C]"></div>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8B6914] text-lg">✝</span>
            </div>
            <div className="w-[42%] text-left pl-2">
              <div className="font-serif text-[28px]">Sony Soy</div>
              <div className="text-[#888888] text-lg my-1">&</div>
              <div className="font-serif text-[28px]">Shyla Soy</div>
            </div>
          </div>

          <p className="text-[12px] uppercase tracking-[0.25em] text-[#888888] font-semibold mt-6">Request the Pleasure of Your Company</p>
          
          <p className="font-serif text-[13px] text-[#AAAAAA] italic mt-4 max-w-[400px] mx-auto">
            "Two are better than one... a cord of three strands is not quickly broken."<br/>— Ecclesiastes 4:9–12
          </p>
        </div>
      </section>

      {/* Individual Portrait Cards */}
      <section className="py-8">
        <div className="max-w-[420px] mx-auto px-5 flex justify-center gap-4">
          <div className="text-center">
            <WeddingPhoto src="groom" alt="Dimal Joseph" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8B6914] mt-3 font-semibold">The Groom</p>
            <p className="font-serif italic text-[22px]">Dimal Joseph</p>
          </div>
          <div className="text-center">
            <WeddingPhoto src="bride" alt="Soniya" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8B6914] mt-3 font-semibold">The Bride</p>
            <p className="font-serif italic text-[22px]">Soniya</p>
          </div>
        </div>
      </section>

      {/* Date Section */}
      <section className="py-10">
        <div className="max-w-[600px] mx-auto px-5 text-center">
          <div className="flex justify-center gap-3 mb-6">
            <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-4 min-w-[90px]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-1">NOVEMBER</p>
              <p className="text-sm text-[#1A1A1A]">2026, Thursday</p>
            </div>
            <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-5 min-w-[100px]">
              <p className="font-serif text-[64px] text-[#8B6914] leading-none">19</p>
            </div>
            <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-4 min-w-[90px]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-1">Time</p>
              <p className="text-lg text-[#1A1A1A]">10 AM</p>
            </div>
          </div>
          <p className="text-[12px] italic text-[#AAAAAA] mb-2">✦ ──── In the presence of God and their loved ones ──── ✦</p>
          <p className="font-serif text-[22px] mb-1 text-[#8B6914] tracking-widest uppercase">St. Joseph Church</p>
          <p className="text-[13px] text-[#888888]">📍 Chempanoda, Perambra, Calicut</p>
        </div>
      </section>

      {/* Countdown */}
      <section className="py-10">
        <div className="max-w-[600px] mx-auto px-5 text-center">
          <p className="text-[12px] uppercase tracking-[0.25em] text-[#888888] font-semibold mb-5">Countdown to the Ceremony</p>
          {renderCountdown()}
        </div>
      </section>

      {/* Response Buttons */}
      {view === 'rsvp' && (
        <section className="py-10 pb-24">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <p className="text-[12px] uppercase tracking-[0.25em] text-[#888888] font-semibold mb-6">Kindly Reply</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleYes} className="flex items-center gap-2 px-5 py-3.5 bg-[#FFFDF8] border border-[#C9A84C] rounded-lg cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-md hover:bg-[#FDF8EC]">
                <span className="text-base">✓</span>
                <span className="text-[13px] font-medium">Joyfully Accepts! 🎉</span>
              </button>
              <button onClick={handleNo} className="flex items-center gap-2 px-5 py-3.5 bg-[#FFFDF8] border border-[#E8AAAA] rounded-lg cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-md hover:bg-[#FDF0F0]">
                <span className="text-base">✗</span>
                <span className="text-[13px] font-medium">Regretfully Declines</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Modal */}
      {view === 'modal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setView('rsvp')} />
          <div className="relative bg-[#FFFDF8] border border-[#E8D9B5] rounded-2xl shadow-lg p-8 max-w-[400px] w-full">
            <h2 className="font-serif text-[36px] mb-2">Wonderful!</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-6">Your Response Details</p>
            
            <div className="text-left mb-4">
              <label className="text-[10px] uppercase tracking-widest text-[#888888] block mb-1">Your Name</label>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Enter your name" className="w-full p-3 border border-[#E8D9B5] rounded-lg text-sm bg-white" />
            </div>
            
            <div className="text-left mb-4">
              <label className="text-[10px] uppercase tracking-widest text-[#888888] block mb-1">Family Name (Optional)</label>
              <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="e.g. Joseph, Family" className="w-full p-3 border border-[#E8D9B5] rounded-lg text-sm bg-white" />
            </div>
            
            <p className="font-serif italic text-xl my-5">How many family members will attend?</p>
            <div className="flex justify-center items-center gap-5 mb-6">
              <button onClick={() => adjustCount(-1)} className="w-9 h-9 rounded-full border border-[#C9A84C] bg-white text-xl cursor-pointer transition hover:bg-gray-100">−</button>
              <div className="font-serif text-[28px] min-w-[40px] text-center">{familyCount}</div>
              <button onClick={() => adjustCount(1)} className="w-9 h-9 rounded-full border border-[#C9A84C] bg-white text-xl cursor-pointer transition hover:bg-gray-100">+</button>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[#888888] mb-4">Including Yourself</p>
            <button onClick={handleSubmit} disabled={isSubmitting || !guestName.trim()} className="w-full py-4 px-6 bg-[#8B6914] text-white border-none rounded-xl text-[14px] font-medium uppercase tracking-widest cursor-pointer transition hover:bg-[#C9A84C] disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting...' : 'Submit Response'}
            </button>
            {error && <p className="text-[#cc4444] text-sm mt-3">Something went wrong. Please try again.</p>}
          </div>
        </div>
      )}

      {/* No Response Modal - Ask for name when declining */}
      {view === 'no' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setView('rsvp')} />
          <div className="relative bg-[#FFFDF8] border border-[#E8D9B5] rounded-2xl shadow-lg p-8 max-w-[400px] w-full">
            <h2 className="font-serif text-[28px] italic mb-3">We'll Keep You in Our Prayers!</h2>
            <p className="text-[#888888] mb-4">Thank you for letting us know.</p>
            
            <div className="text-left mb-4">
              <label className="text-[10px] uppercase tracking-widest text-[#888888] block mb-1">Your Name</label>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Enter your name" className="w-full p-3 border border-[#E8D9B5] rounded-lg text-sm bg-white" />
            </div>
            
            <div className="text-left mb-4">
              <label className="text-[10px] uppercase tracking-widest text-[#888888] block mb-1">Family Name (Optional)</label>
              <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="e.g. Joseph, Family" className="w-full p-3 border border-[#E8D9B5] rounded-lg text-sm bg-white" />
            </div>
            
            <button onClick={() => submitNoResponse()} disabled={isSubmitting || !guestName.trim()} className="w-full py-4 px-6 bg-[#999999] text-white border-none rounded-xl text-[14px] font-medium uppercase tracking-widest cursor-pointer transition hover:bg-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting...' : 'Confirm Decline'}
            </button>
            {error && <p className="text-[#cc4444] text-sm mt-3">Something went wrong. Please try again.</p>}
          </div>
        </div>
      )}

      {/* Confirmation */}
      {view === 'confirmation' && (
        <section className="py-10 pb-20">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <h1 className="font-serif text-[48px] mb-2">We're Getting Married!</h1>
            <p className="text-[12px] uppercase tracking-[0.25em] text-[#888888] font-semibold mb-6">DIMAL & SONIYA</p>
            
            <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-5 mb-6 relative">
              <span className="absolute top-2 left-3 text-[#8B6914] text-2xl">"</span>
              <p className="font-serif italic text-lg py-4">Your Response has been received!<br/>We're so grateful to share this blessing with you.</p>
              <span className="absolute bottom-2 right-3 text-[#8B6914] text-2xl">"</span>
            </div>

            <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-5 mb-5 flex justify-between text-left">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#888888] mb-1">Date</p>
                <p className="font-serif text-base mb-1">19 / November / 2026</p>
                <p className="font-serif text-base">Ceremony Time: 10 AM</p>
              </div>
              <div className="w-px bg-[#E8D9B5]"></div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#888888] mb-1">Venue</p>
                <p className="font-serif text-base mb-1">St. Joseph Church</p>
                <p className="font-serif text-base mb-2">Chempanoda, Perambra</p>
                <a href="https://maps.app.goo.gl/dPBk7iywoCoFgGRv8" target="_blank" className="text-[11px] text-[#8B6914] no-underline border-b border-[#8B6914]">📍 Click Here for Location</a>
              </div>
            </div>

            <a href="tel:9995558877" className="block w-full py-3 border border-[#8B6914] rounded-lg text-[#1A1A1A] no-underline mb-8">
              📞 999 555 8877
            </a>

            <div className="mt-8">
              <p className="text-[12px] uppercase tracking-[0.25em] text-[#888888] font-semibold mb-4">Countdown to the Ceremony</p>
              {renderCountdown()}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default App