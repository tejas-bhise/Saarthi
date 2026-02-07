import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('dark');

  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleAuthClick = (mode) => {
    navigate('/auth', { state: { mode } });
  };

  const handleGetStarted = () => {
    navigate('/auth', { state: { mode: 'signup' } });
  };

  return (
    <div className={isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}>
      {/* NAVBAR */}
      <nav
        className={
          'fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors ' +
          (isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200')
        }
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              S
            </div>
            <span className={isDark ? 'text-xl font-bold text-white' : 'text-xl font-bold text-slate-900'}>
              Saarthi
            </span>
          </div>

          {/* Right: Theme + Auth Buttons */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={
                'p-2 rounded-lg transition-colors ' +
                (isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700')
              }
              title="Toggle theme"
            >
              {isDark ? (
                // Sun
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                // Moon
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Login */}
            <button
              onClick={() => handleAuthClick('login')}
              className={
                'px-4 py-2 font-medium transition-colors ' +
                (isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900')
              }
            >
              Login
            </button>

            {/* Sign Up */}
            <button
              onClick={() => handleAuthClick('signup')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
<section
  className={
    'pt-36 pb-28 px-6 overflow-hidden transition-colors ' +
    (isDark ? 'bg-slate-950' : 'bg-slate-50')
  }
>
  <div className="max-w-5xl mx-auto text-center">

    {/* Core Identity */}
    <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
      <span className={isDark ? 'text-white' : 'text-slate-900'}>
        Saarthi
      </span>
    </h1>

    {/* Meaning */}
    <p
      className={
        'text-base md:text-lg italic mb-10 ' +
        (isDark ? 'text-gray-400' : 'text-slate-500')
      }
    >
      सारथि — the one who guides the chariot
    </p>

    {/* Philosophy Line */}
    <p
      className={
        'text-2xl md:text-3xl font-medium leading-relaxed max-w-3xl mx-auto mb-14 ' +
        (isDark ? 'text-gray-200' : 'text-slate-700')
      }
    >
      A guide for the journey you must walk yourself.
    </p>

    {/* Supporting Context (very minimal) */}
    <p
      className={
        'text-lg max-w-2xl mx-auto mb-16 leading-relaxed ' +
        (isDark ? 'text-gray-400' : 'text-slate-600')
      }
    >
      Built for moments of quiet effort — when you choose discipline,
      consistency, and growth, even when no one is watching.
    </p>

    {/* Single Primary Action */}
    <div className="flex justify-center mb-10">
      <button
        onClick={handleGetStarted}
        className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-500/30"
      >
        Begin →
      </button>
    </div>

    {/* Soft Footer Line */}
    <p className={isDark ? 'text-sm text-gray-500' : 'text-sm text-slate-500'}>
      No noise. No rush. Just forward movement.
    </p>

  </div>
</section>


      {/* SHLOK BLOCK – PAUSE / REFLECTION */}
<section className={isDark ? 'bg-slate-950' : 'bg-slate-50'}>
  <div className="max-w-4xl mx-auto px-6 py-28">
    
    <div
      className={
        'rounded-2xl px-8 py-16 text-center border transition-all duration-500 ' +
        (isDark
          ? 'bg-slate-900/60 border-slate-800'
          : 'bg-white border-slate-200')
      }
    >
      {/* Sanskrit Shlok */}
      <p className="
        italic text-xl md:text-2xl text-gray-200 leading-relaxed tracking-wide
        transition-all duration-500
        hover:text-white hover:drop-shadow-[0_0_12px_rgba(99,102,241,0.25)]
      ">
        कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।<br />
        मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥
      </p>

      {/* Divider */}
      <div className="my-10 flex justify-center">
        <div className="h-px w-20 bg-indigo-500/40" />
      </div>

      {/* Hinglish Meaning */}
      <p className="
        italic text-base md:text-lg text-gray-400 leading-relaxed
        transition-all duration-500
        hover:text-gray-300
      ">
        Tumhara adhikar toh keval karma karna hai,<br />
        phal toh Ishwar ke haath mein hai.
      </p>

      {/* Core Line */}
      <p className="
        mt-6 text-2xl md:text-3xl italic text-white
        transition-all duration-500
        hover:scale-[1.03] hover:text-indigo-300
      ">
        Isliye keval karma karo.
      </p>

      {/* Saarthi Meaning */}
      <p className="
        mt-12 italic text-base md:text-lg text-gray-400 leading-relaxed
        transition-all duration-500
        hover:text-indigo-300
      ">
        Like the <span className="text-indigo-400">सारथि</span> in the Mahabharata,<br />
        Saarthi does not promise victory —<br />
        <span className="font-medium underline underline-offset-4 decoration-indigo-500/40">
          it helps you move forward with clarity and courage.
        </span>
      </p>
    </div>

  </div>
</section>


      {/* WHY THE NAME "SAARTHI" */}
      <section
        className={
          'py-20 px-6 transition-colors ' +
          (isDark ? 'bg-slate-900' : 'bg-white')
        }
      >
        <div className="max-w-5xl mx-auto">
          <h2
            className={
              isDark
                ? 'text-3xl md:text-4xl font-bold text-white mb-8 text-center'
                : 'text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center'
            }
          >
            Why the Name “Saarthi”
          </h2>

          {/* Krishna & Mahabharat context */}
          <div className="mb-10 text-center">
            <p
              className={
                isDark
                  ? 'text-sm md:text-base text-indigo-300 italic mb-3'
                  : 'text-sm md:text-base text-indigo-600 italic mb-3'
              }
            >
              In the Mahabharata, the सारथि was not the warrior.  
              He did not hold the weapon. He held the responsibility of guidance.
            </p>
            <p className={isDark ? 'text-sm text-gray-400' : 'text-sm text-slate-600'}>
              When the battlefield was loud and confusing, it was the सारथि who kept the chariot steady and the direction clear.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Left – modern context */}
            <div>
              <h3
                className={
                  isDark
                    ? 'text-xl font-semibold text-white mb-3'
                    : 'text-xl font-semibold text-slate-900 mb-3'
                }
              >
                The world is more connected, but studying often feels more isolated.
              </h3>
              <p
                className={
                  isDark
                    ? 'text-sm md:text-base text-gray-300 mb-4'
                    : 'text-sm md:text-base text-slate-700 mb-4'
                }
              >
                Group studies are rare. Schedules don’t match. It’s not always easy to ask friends or teachers for help, especially when it’s late or when a doubt feels “too basic”.
              </p>
              <p
                className={
                  isDark
                    ? 'text-sm md:text-base text-gray-300'
                    : 'text-sm md:text-base text-slate-700'
                }
              >
                Saarthi is built for those quiet hours — when you choose to study alone, but still wish someone understood where you are stuck and what you’re trying to become.
              </p>
            </div>

            {/* Right – purpose of platform */}
            <div
              className={
                'rounded-2xl p-6 border transition-colors ' +
                (isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-50 border-slate-200')
              }
            >
              <h3
                className={
                  isDark
                    ? 'text-xl font-semibold text-white mb-3'
                    : 'text-xl font-semibold text-slate-900 mb-3'
                }
              >
                What Saarthi means for you
              </h3>
              <ul className="space-y-3 text-sm md:text-base">
                <li className={isDark ? 'text-gray-300' : 'text-slate-700'}>
                  • A place where you can ask freely, at your own time, without feeling judged.
                </li>
                <li className={isDark ? 'text-gray-300' : 'text-slate-700'}>
                  • A guide that remembers your topics, your doubts, and your pace — so you don’t start from zero every session.
                </li>
                <li className={isDark ? 'text-gray-300' : 'text-slate-700'}>
                  • A steady presence for your studies and growth, even when others are busy or unavailable.
                </li>
              </ul>

              <p
                className={
                  isDark
                    ? 'mt-5 text-sm md:text-base text-gray-200 font-medium'
                    : 'mt-5 text-sm md:text-base text-slate-800 font-medium'
                }
              >
                Saarthi is not here to replace people in your life.  
                It exists so that your journey of learning never has to feel completely unsupported.
              </p>

              <p
                className={
                  isDark
                    ? 'mt-4 text-xs md:text-sm text-gray-400'
                    : 'mt-4 text-xs md:text-sm text-slate-600'
                }
              >
                Saarthi is built to be available — across sessions, across timings, across the moments when you quietly choose to keep going.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW SAARTHI FITS YOUR ROUTINE */}
      <section
        id="how-saarthi-works"
        className={
          'py-20 px-6 transition-colors ' +
          (isDark ? 'bg-slate-950' : 'bg-slate-100')
        }
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className={
              isDark
                ? 'text-3xl md:text-4xl font-bold text-white mb-4 text-center'
                : 'text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center'
            }
          >
            How Saarthi Fits Into Your Study Routine
          </h2>
          <p
            className={
              isDark
                ? 'text-lg text-gray-400 text-center max-w-3xl mx-auto mb-12'
                : 'text-lg text-slate-600 text-center max-w-3xl mx-auto mb-12'
            }
          >
            Think of it as a guide you can open anytime, pick up where you left off, and ask anything — without hesitation.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div
              className={
                'rounded-2xl p-6 border transition-colors ' +
                (isDark
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200')
              }
            >
              <h3
                className={
                  isDark
                    ? 'text-lg font-semibold text-white mb-2'
                    : 'text-lg font-semibold text-slate-900 mb-2'
                }
              >
                1. Pick your tutor
              </h3>
              <p className={isDark ? 'text-sm text-gray-300' : 'text-sm text-slate-700'}>
                Choose Omkar for AI & ML or Priya for Biology. Each tutor is focused on that subject’s concepts and common doubts.
              </p>
            </div>

            <div
              className={
                'rounded-2xl p-6 border transition-colors ' +
                (isDark
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200')
              }
            >
              <h3
                className={
                  isDark
                    ? 'text-lg font-semibold text-white mb-2'
                    : 'text-lg font-semibold text-slate-900 mb-2'
                }
              >
                2. Learn through conversation
              </h3>
              <p className={isDark ? 'text-sm text-gray-300' : 'text-sm text-slate-700'}>
                Start a session, talk or type naturally, and get explanation-first responses through a 3D avatar with voice.
              </p>
            </div>

            <div
              className={
                'rounded-2xl p-6 border transition-colors ' +
                (isDark
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200')
              }
            >
              <h3
                className={
                  isDark
                    ? 'text-lg font-semibold text-white mb-2'
                    : 'text-lg font-semibold text-slate-900 mb-2'
                }
              >
                3. Resume any time
              </h3>
              <p className={isDark ? 'text-sm text-gray-300' : 'text-sm text-slate-700'}>
                Your sessions are saved. From the dashboard, you can reopen any past session and continue exactly from where you paused.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TUTORS */}
      <section
        className={
          'py-20 px-6 transition-colors ' +
          (isDark ? 'bg-slate-900' : 'bg-white')
        }
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className={
              isDark
                ? 'text-3xl md:text-4xl font-bold text-white mb-4 text-center'
                : 'text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center'
            }
          >
            Meet the Current Saarthi Tutors
          </h2>
          <p
            className={
              isDark
                ? 'text-lg text-gray-400 text-center max-w-3xl mx-auto mb-12'
                : 'text-lg text-slate-600 text-center max-w-3xl mx-auto mb-12'
            }
          >
            Saarthi will grow over time, but today you can already learn deeply with two focused guides.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Omkar */}
            <div
              className={
                'rounded-2xl p-8 border transition-colors ' +
                (isDark
                  ? 'bg-slate-950 border-indigo-500/40'
                  : 'bg-slate-50 border-indigo-200')
              }
            >
              <h3
                className={
                  isDark
                    ? 'text-2xl font-bold text-white mb-2'
                    : 'text-2xl font-bold text-slate-900 mb-2'
                }
              >
                Omkar — AI & Machine Learning
              </h3>
              <p className={isDark ? 'text-sm text-gray-300 mb-4' : 'text-sm text-slate-700 mb-4'}>
                For students exploring modern AI and ML. Omkar explains algorithms and intuitions like a senior engineer: structured, clear, and grounded in examples.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/40">
                  Machine Learning Basics
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/40">
                  Neural Networks
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/40">
                  Intuition Building
                </span>
              </div>
            </div>

            {/* Priya */}
            <div
              className={
                'rounded-2xl p-8 border transition-colors ' +
                (isDark
                  ? 'bg-slate-950 border-purple-500/40'
                  : 'bg-slate-50 border-purple-200')
              }
            >
              <h3
                className={
                  isDark
                    ? 'text-2xl font-bold text-white mb-2'
                    : 'text-2xl font-bold text-slate-900 mb-2'
                }
              >
                Priya — Biology
              </h3>
              <p className={isDark ? 'text-sm text-gray-300 mb-4' : 'text-sm text-slate-700 mb-4'}>
                For students trying to truly understand life sciences. Priya focuses on processes, diagrams, and “why this happens” explanations instead of pure memorization.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/40">
                  Cell Biology
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/40">
                  Genetics
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/40">
                  Systems & Processes
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section
        className={
          'py-24 px-6 transition-colors ' +
          (isDark ? 'bg-slate-950' : 'bg-slate-100')
        }
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className={
              isDark
                ? 'text-3xl md:text-4xl font-bold text-white mb-8'
                : 'text-3xl md:text-4xl font-bold text-slate-900 mb-8'
            }
          >
            Why Saarthi Exists
          </h2>
          <div className="space-y-5 text-lg md:text-xl leading-relaxed">
            <p className={isDark ? 'text-gray-300' : 'text-slate-700'}>
              Education is not a race. It is a <span className="font-semibold">journey of understanding</span>.
            </p>
            <p className={isDark ? 'text-gray-300' : 'text-slate-700'}>
              Saarthi exists so that, even when you study on your own, you don’t have to walk that journey without guidance.
            </p>
            <p className={isDark ? 'text-gray-300' : 'text-slate-700'}>
              Not a chatbot. Not a search tool.
            </p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
              A companion for learning.
            </p>
          </div>

          <div className="mt-10">
            <button
              onClick={handleGetStarted}
              className={
                'px-10 py-4 rounded-xl text-lg font-semibold shadow-lg transition-colors ' +
                (isDark
                  ? 'bg-white text-slate-900 hover:bg-gray-100'
                  : 'bg-slate-900 text-white hover:bg-black')
              }
            >
              Begin Your Journey
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className={
          'py-10 px-6 border-t transition-colors ' +
          (isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200')
        }
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              S
            </div>
            <span className={isDark ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-slate-900'}>
              Saarthi
            </span>
          </div>
          <p className={isDark ? 'text-sm text-gray-400' : 'text-sm text-slate-500'}>
            © 2026 Saarthi. Your AI-powered learning companion.
          </p>
        </div>
      </footer>
    </div>
  );
};
