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
    const colors = ['#F5E6C8', '#E8C97A', '#FFFDF8', '#C9A84C']
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
    await submitRSVP(guestName || 'Guest', familyName, false, 0)
  }

  const submitRSVP = async (name, familyNameInput, attending, count) => {
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
    await submitRSVP(guestName, familyName, true, familyCount)
  }

  const adjustCount = (delta) => {
    setFamilyCount(prev => Math.max(1, Math.min(10, prev + delta)))
  }

  const formatNum = (n) => String(n).padStart(2, '0')

  const renderCountdown = () => (
    <div className="flex justify-center gap-2.5">
      {[
        { value: countdown.days, label: 'Days' },
        { value: countdown.hours, label: 'Hours' },
        { value: countdown.mins, label: 'Mins' },
        { value: countdown.secs, label: 'Secs' }
      ].map((item, i) => (
        <div key={i} className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-3.5 min-w-[68px]">
          <div className="text-[36px] font-serif text-[#8B6914] leading-none mb-1">{formatNum(item.value)}</div>
          <div className="text-[9px] uppercase tracking-widest text-[#888888]">{item.label}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Hero Section */}
      <section className="pt-20 pb-10">
        <div className="max-w-[600px] mx-auto px-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#888888] font-medium mb-4">Joyfully Invite You To Celebrate</p>
          <h1 className="font-serif text-4xl md:text-[44px] mb-3 leading-tight">Dimal's Wedding</h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#888888] font-medium mb-7">Together With Their Families</p>

          <div className="flex justify-center items-start gap-0 mb-7">
            <div className="w-[42%] text-right pr-2">
              <div className="font-serif text-[26px]">Dimal Joseph</div>
              <div className="font-serif text-2xl">& Family</div>
            </div>
            <div className="w-[16%] relative">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-20 bg-[#E8D9B5]"></div>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8B6914] text-lg">💍</span>
            </div>
            <div className="w-[42%] text-left pl-2">
              <div className="font-serif text-[26px]">Soniya</div>
              <div className="text-[#888888] text-lg my-1">&</div>
              <div className="font-serif text-[26px]">Family</div>
            </div>
          </div>

          <p className="text-[11px] uppercase tracking-[0.2em] text-[#888888] font-medium mt-6">Request the Pleasure of Your Company</p>
          
          <p className="font-serif text-[13px] text-[#AAAAAA] italic mt-4 max-w-[400px] mx-auto">
            "Two are better than one... a cord of three strands is not quickly broken."<br/>— Ecclesiastes 4:9–12
          </p>
        </div>
      </section>

      {/* Date Section */}
      <section className="py-10">
        <div className="max-w-[600px] mx-auto px-5 text-center">
          <div className="flex justify-center gap-3 mb-6">
            <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-4 min-w-[90px]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-1">November</p>
              <p className="text-sm text-[#1A1A1A]">2026, Thursday</p>
            </div>
            <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-5 min-w-[100px]">
              <p className="font-serif text-[58px] text-[#8B6914] leading-none">19</p>
            </div>
            <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-4 min-w-[90px]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-1">Time</p>
              <p className="text-lg text-[#1A1A1A]">10 AM</p>
            </div>
          </div>
          <p className="text-[13px] text-[#888888] mb-2">✦ In the presence of God and their loved ones ✦</p>
          <p className="font-serif text-[22px] mb-1">St. Joseph Church</p>
          <p className="text-[13px] text-[#888888]">📍 Chempanoda, Perambra, Calicut</p>
        </div>
      </section>

      {/* Countdown */}
      <section className="py-10">
        <div className="max-w-[600px] mx-auto px-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#888888] font-medium mb-5">Countdown to the Ceremony</p>
          {renderCountdown()}
        </div>
      </section>

      {/* RSVP Buttons */}
      {view === 'rsvp' && (
        <section className="py-10 pb-20">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#888888] font-medium mb-6">Kindly Reply</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleYes} className="flex items-center gap-2 px-5 py-3.5 bg-[#FFFDF8] border border-[#E8D9B5] rounded-lg cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-md hover:border-[#C9A84C]">
                <span className="text-base">✓</span>
                <span className="text-[13px] font-medium">Joyfully Accepts! 🎉</span>
              </button>
              <button onClick={handleNo} className="flex items-center gap-2 px-5 py-3.5 bg-[#FFFDF8] border border-[#E8D9B5] rounded-lg cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-md hover:border-[#e8b4b4]">
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
            <h2 className="font-serif text-[32px] mb-2">Wonderful!</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-6">Your RSVP Details</p>
            
            <div className="text-left mb-4">
              <label className="text-[10px] uppercase tracking-widest text-[#888888] block mb-1">Your Name</label>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Enter your name" className="w-full p-3 border border-[#E8D9B5] rounded-lg text-sm bg-white" />
            </div>
            
            <div className="text-left mb-4">
              <label className="text-[10px] uppercase tracking-widest text-[#888888] block mb-1">Family Name (Optional)</label>
              <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="e.g. Khan, PC, etc." className="w-full p-3 border border-[#E8D9B5] rounded-lg text-sm bg-white" />
            </div>
            
            <p className="font-serif text-xl italic my-5">How many family members will attend?</p>
            <div className="flex justify-center items-center gap-5 mb-6">
              <button onClick={() => adjustCount(-1)} className="w-9 h-9 rounded-full border border-[#E8D9B5] bg-white text-xl cursor-pointer transition hover:bg-gray-100">−</button>
              <div className="font-serif text-[28px] min-w-[40px] text-center">{familyCount}</div>
              <button onClick={() => adjustCount(1)} className="w-9 h-9 rounded-full border border-[#E8D9B5] bg-white text-xl cursor-pointer transition hover:bg-gray-100">+</button>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[#888888] mb-4">Including Yourself</p>
            <button onClick={handleSubmit} disabled={isSubmitting || !guestName.trim()} className="w-full py-4 px-6 bg-[#8B6914] text-white border-none rounded-lg text-[14px] font-medium uppercase tracking-widest cursor-pointer transition hover:bg-[#C9A84C] disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
            </button>
            {error && <p className="text-[#cc4444] text-sm mt-3">Something went wrong. Please try again.</p>}
          </div>
        </div>
      )}

      {/* No RSVP */}
      {view === 'no' && (
        <section className="py-10">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-2xl shadow-sm p-8 max-w-[400px] mx-auto">
              <h2 className="font-serif text-[28px] mb-3">We'll Keep You in Our Prayers!</h2>
              <p className="text-[#888888]">Thank you for letting us know.</p>
            </div>
          </div>
        </section>
      )}

      {/* Confirmation */}
      {view === 'confirmation' && (
        <section className="py-10 pb-20">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <h1 className="font-serif text-[42px] mb-2">We're Getting Married!</h1>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#888888] font-medium mb-6">DIMAL'S WEDDING</p>
            
            <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-5 mb-6">
              <p className="font-serif text-lg italic">Your RSVP has been received!<br/>We're so grateful to share this blessing with you.</p>
            </div>

            <div className="bg-[#FFFDF8] border border-[#E8D9B5] rounded-xl shadow-sm p-5 mb-5 flex justify-between text-left">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#888888] mb-1">Date</p>
                <p className="font-serif text-base mb-1">19 / November / 2026</p>
                <p className="font-serif text-base">Ceremony Time: 10 AM</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#888888] mb-1">Venue</p>
                <p className="font-serif text-base mb-1">St. Joseph Church</p>
                <p className="font-serif text-base mb-2">Chempanoda, Perambra, Calicut</p>
                <a href="https://maps.app.goo.gl/dPBk7iywoCoFgGRv8" target="_blank" className="text-[11px] text-[#8B6914] no-underline border-b border-[#8B6914]">📍 Click Here for Location</a>
              </div>
            </div>

            <a href="tel:9995558877" className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFFDF8] border border-[#E8D9B5] rounded-lg text-[#1A1A1A] no-underline mb-8">
              <span>📞</span> 999 555 8877
            </a>

            <div className="mt-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#888888] font-medium mb-4">Countdown to the Ceremony</p>
              {renderCountdown()}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default App