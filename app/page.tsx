"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Code, Building, Award, User, Briefcase, GraduationCap, Moon, Sun, ChevronUp, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"

const PianoKey = ({
  note,
  isBlack = false,
  isPressed = false,
  onClick,
  section,
}: {
  note: string
  isBlack?: boolean
  isPressed?: boolean
  onClick?: () => void
  section?: string
}) => {
  const keyRef = useRef<HTMLDivElement | null>(null)
  const labelTextRef = useRef<HTMLSpanElement | null>(null)
  const [labelScale, setLabelScale] = useState(1)
  const labelMap: Record<string, string> = {
    Certifications: "Certs",
    Leadership: "Leader",
    Management: "Mgmt",
    Projects: "Proj",
  }
  const displaySection = section ? (labelMap[section] ?? section) : section
  const isLeadership = displaySection === "Leadership"
  const labelSizeClass = isBlack
    ? (isLeadership ? "text-[9px] xs:text-[10px] sm:text-[11px] md:text-[12px]" : "text-[7px] xs:text-[8px] sm:text-[10px] md:text-[12px]")
    : (isLeadership ? "text-[10px] sm:text-[12px]" : "text-[8px] sm:text-[10px] md:text-[12px]")

  // Dynamically scale slanted label to fit within key width on small screens
  useEffect(() => {
    const recalcLabelScale = () => {
      const keyWidth = keyRef.current?.clientWidth ?? 0
      const textEl = labelTextRef.current
      if (!keyWidth || !textEl) return
      const currentScale = labelScale || 1
      const rect = textEl.getBoundingClientRect()
      const scaledWidth = rect.width
      const unscaledWidth = scaledWidth / currentScale
      const paddingAllowance = 2 // tighter allowance for mobile
      const available = Math.max(8, keyWidth - paddingAllowance)
      const neededScale = Math.min(1, available / unscaledWidth)
      const clamped = Math.max(0.2, Math.min(1, neededScale))
      if (Math.abs(clamped - labelScale) > 0.02) {
        setLabelScale(clamped)
      }
    }
    recalcLabelScale()
    window.addEventListener("resize", recalcLabelScale)
    window.addEventListener("orientationchange", recalcLabelScale)
    return () => {
      window.removeEventListener("resize", recalcLabelScale)
      window.removeEventListener("orientationchange", recalcLabelScale)
    }
  }, [displaySection, isBlack, labelScale])
  return (
    <div
      className={`
        ${
          isBlack
            ? "bg-gradient-to-b from-slate-900 to-black text-white w-8 h-28 -mx-1 transform-gpu -translate-y-6 md:w-14 md:h-40 md:-mx-3 md:-translate-y-8 z-20 relative shadow-2xl border border-slate-700 rounded-md"
            : "bg-gradient-to-b from-white to-gray-50 text-slate-900 w-12 h-48 md:w-24 md:h-64 z-10 border border-gray-300 shadow-lg rounded-b-md"
        }
        ${isPressed ? (isBlack ? "from-slate-700 to-slate-900 shadow-inner scale-[0.98]" : "from-gray-100 to-gray-200 shadow-inner scale-[0.98]") : ""}
        flex flex-col items-center justify-end pb-6 cursor-pointer
        transition-all duration-150 ease-out hover:shadow-xl
        ${isBlack ? "hover:from-neutral-800 hover:to-neutral-900" : "hover:from-neutral-50 hover:to-white dark:hover:from-neutral-100 dark:hover:to-white"}
        rounded-b-sm relative overflow-hidden
      `}
      onClick={onClick}
      ref={keyRef}
    >
      {section && (
        <div className="text-center mb-2 sm:mb-4">
          <div
            className={`font-semibold ${labelSizeClass} normal-case tracking-normal box-border text-center leading-snug
            ${isBlack ? "text-white" : "text-neutral-800 dark:text-neutral-900"}
            ${isPressed ? "opacity-100" : "opacity-90"} transition-all duration-150
            inline-block mx-auto w-fit whitespace-nowrap rotate-[-20deg] origin-bottom-left sm:rotate-0 sm:origin-center
            px-0 py-0 sm:px-2 sm:py-1
            sm:shadow-sm ${isBlack ? "sm:bg-white/20 sm:border sm:border-white/25 sm:rounded-md" : "sm:bg-black/5 sm:dark:bg-white/60 sm:border sm:border-black/10 sm:dark:border-white/40 sm:rounded-md"}`}
            title={section}
          >
            <span
              ref={labelTextRef}
              className="inline-block whitespace-nowrap"
              style={{ transform: `scale(${labelScale})` }}
            >
              {displaySection}
            </span>
          </div>
        </div>
      )}

      <span
        className={`relative z-10 font-bold ${isBlack ? "text-sm md:text-base" : "text-base md:text-lg"} block w-full text-center leading-tight select-none pointer-events-none px-1 whitespace-nowrap ${isBlack ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]" : "text-neutral-900 dark:text-neutral-900"} ${isPressed ? "scale-95" : ""} transition-transform duration-150`}
      >
        {note}
      </span>
    </div>
  )
}

export default function InteractiveResume() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [pressedKeys, setPressedKeys] = useState<string[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const keyboardWrapperRef = useRef<HTMLDivElement | null>(null)
  const keyboardInnerRef = useRef<HTMLDivElement | null>(null)
  const [keyboardScale, setKeyboardScale] = useState(1)
  const [isMobileKeyboardOpen, setIsMobileKeyboardOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Open mobile keyboard by default in portrait on small screens
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const isSmallNow = window.matchMedia("(max-width: 1023px)").matches
      if (isSmallNow) {
        setIsMobileKeyboardOpen(true)
      }
    } catch {
      // no-op
    }
  }, [])

  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        // Best-effort resume on user gesture
        audioContextRef.current.resume().catch(() => {})
      }
    }

    const handleFirstInteraction = () => {
      initAudio()
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
      document.removeEventListener("touchstart", handleFirstInteraction)
      document.removeEventListener("pointerdown", handleFirstInteraction)
    }

    document.addEventListener("click", handleFirstInteraction)
    document.addEventListener("keydown", handleFirstInteraction)
    document.addEventListener("touchstart", handleFirstInteraction, { passive: true })
    document.addEventListener("pointerdown", handleFirstInteraction)
    return () => {
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
      document.removeEventListener("touchstart", handleFirstInteraction)
      document.removeEventListener("pointerdown", handleFirstInteraction)
    }
  }, [])

  // Ensure the keyboard fits horizontally; on small screens also scale up to fill width
  useEffect(() => {
    const recalcScale = () => {
      const wrapper = keyboardWrapperRef.current
      const inner = keyboardInnerRef.current
      if (!wrapper || !inner) return
      const available = wrapper.clientWidth
      const needed = inner.scrollWidth
      if (needed === 0) return
      const ratio = available / needed
      const allowUpscale = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches
      const target = allowUpscale ? ratio : Math.min(1, ratio)
      const scale = Math.max(0.5, Math.min(1.3, target))
      setKeyboardScale(scale)
    }
    recalcScale()
    const onResize = () => recalcScale()
    window.addEventListener("resize", onResize)
    window.addEventListener("orientationchange", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("orientationchange", onResize)
    }
  }, [])

  // Recalculate scale when mobile keyboard panel opens (layout size changes)
  useEffect(() => {
    if (!isMobileKeyboardOpen) return
    const t = window.setTimeout(() => {
      const wrapper = keyboardWrapperRef.current
      const inner = keyboardInnerRef.current
      if (!wrapper || !inner) return
      const available = wrapper.clientWidth
      const needed = inner.scrollWidth
      if (needed === 0) return
      const ratio = available / needed
      const allowUpscale = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches
      const target = allowUpscale ? ratio : Math.min(1, ratio)
      const scale = Math.max(0.5, Math.min(1.3, target))
      setKeyboardScale(scale)
    }, 50)
    return () => window.clearTimeout(t)
  }, [isMobileKeyboardOpen])

  useEffect(() => {
    if (!activeSection) return
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        setActiveSection(null)
      }
    }
    document.addEventListener("mousedown", handleMouseDown)
    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
    }
  }, [activeSection])

  // Keep mobile keyboard open even when a modal opens; modals will overlay it via z-index

  // (Removed mobile orientation hint logic)

  const sections = [
    { id: "summary", label: "Summary", note: "C", icon: User },
    { id: "skills", label: "Skills", note: "C#", icon: Code },
    { id: "tech", label: "Tech Stack", note: "D", icon: Code },
    { id: "projects", label: "Projects", note: "D#", icon: Building },
    { id: "experience", label: "Experience", note: "E", icon: Briefcase },
    { id: "education", label: "Education", note: "F", icon: GraduationCap },
    { id: "certifications", label: "Certifications", note: "F#", icon: Award },
    { id: "achievements", label: "Achievements", note: "G", icon: Award },
    { id: "leadership", label: "Leadership", note: "G#", icon: User },
    { id: "technical", label: "Technical", note: "A", icon: Code },
    { id: "management", label: "Management", note: "A#", icon: Briefcase },
    { id: "strategy", label: "Strategy", note: "B", icon: Building },
  ]

  const pianoKeys = [
    { note: "C", isBlack: false, section: "Summary" },
    { note: "C#", isBlack: true, section: "Skills" },
    { note: "D", isBlack: false, section: "Tech Stack" },
    { note: "D#", isBlack: true, section: "Projects" },
    { note: "E", isBlack: false, section: "Experience" },
    { note: "F", isBlack: false, section: "Education" },
    { note: "F#", isBlack: true, section: "Certifications" },
    { note: "G", isBlack: false, section: "Achievements" },
    { note: "G#", isBlack: true, section: "Leadership" },
    { note: "A", isBlack: false, section: "Technical" },
    { note: "A#", isBlack: true, section: "Management" },
    { note: "B", isBlack: false, section: "Strategy" },
  ]

  // Map keyboard keys to piano notes. Holding Shift selects the sharp where applicable.
  const mapKeyToNote = (key: string, isShift: boolean): string | null => {
    const k = key.toLowerCase()
    switch (k) {
      case "c":
        return isShift ? "C#" : "C"
      case "d":
        return isShift ? "D#" : "D"
      case "e":
        return "E"
      case "f":
        return isShift ? "F#" : "F"
      case "g":
        return isShift ? "G#" : "G"
      case "a":
        return isShift ? "A#" : "A"
      case "b":
        return "B"
      default:
        return null
    }
  }

  const playNote = (note: string, sectionId?: string, event?: React.MouseEvent) => {
    setPressedKeys((prev) => [...prev, note])

    if (sectionId) {
      setActiveSection(sectionId)
    }

    if (audioContextRef.current) {
      const audioContext = audioContextRef.current
      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {})
      }
      const noteFrequencies: { [key: string]: number } = {
        C: 261.63,
        "C#": 277.18,
        D: 293.66,
        "D#": 311.13,
        E: 329.63,
        F: 349.23,
        "F#": 369.99,
        G: 392.0,
        "G#": 415.3,
        A: 440.0,
        "A#": 466.16,
        B: 493.88,
      }

      const frequency = noteFrequencies[note]
      if (frequency) {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)

        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.8)
      }
    }

    setTimeout(() => setPressedKeys((prev) => prev.filter((key) => key !== note)), 200)
  }

  const closeModal = () => {
    setActiveSection(null)
  }

  const getSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "summary":
        return {
          title: "Professional Summary",
          content:
            "Senior Software Engineer with 7+ years of experience delivering enterprise-grade solutions across financial services, healthcare, and technology sectors. Proven track record of leading full-stack development initiatives, modernizing legacy systems, and implementing scalable architectures. Currently serving as Co-Lead Developer at Build and Serve, specializing in AI-assisted development and code optimization strategies.",
        }
      case "skills":
        return {
          title: "Core Technical Skills",
          content:
            "Full-Stack Development • System Architecture • Database Design • API Development • Cloud Computing • DevOps Implementation • Code Review & Quality Assurance • Performance Optimization • Legacy System Modernization • Team Leadership • Technical Documentation • Agile/Scrum Methodologies",
        }
      case "tech":
        return {
          title: "Technology Stack",
          content:
            "Frontend: Angular (v19/20), Next.js (v14+), React, TypeScript, HTML5, CSS3 • Backend: C# (.NET 8+), Node.js, Python (3.13), Go (1.24), Ruby on Rails • Cloud: AWS (Bedrock, Lambda, S3, SageMaker), Azure DevOps • Databases: Oracle 23ai, MySQL (8.x), SQL Server, PostgreSQL • Tools: Entity Framework, SSIS, Docker, Git, CI/CD Pipelines",
        }
      case "projects":
        return {
          title: "Key Projects",
          content:
            "AI Code Rehabilitation Platform - Led development of proprietary system for optimizing AI-generated code • Banking Application Modernization - Migrated legacy SSRS systems to modern MVC architecture • Healthcare Data Integration - Built SSIS packages processing government compliance data • Enterprise Web Portal Migration - Converted ASP.NET applications to Angular 7 with .NET Core 2.2",
        }
      case "experience":
        return {
          title: "Professional Experience",
          content:
            "Build and Serve (2024-Present): Co-Lead/Full Stack Developer - Leading multi-project development initiatives • Bank of America (2019-2021): Software Engineer - Full-cycle development in .NET ecosystem • Atrium Health (2018-2019): Software Engineer - Healthcare system modernization • Previous roles at COLLABERA/RELIAS and RobertHalf Technology",
        }
      case "education":
        return {
          title: "Education & Training",
          content:
            "Bachelor of Science in Computer Science, University of North Carolina Charlotte (2016) • Minor in Japanese Language Studies • Classical Piano Accompanist for Music Majors • Continuous professional development in cloud technologies, AI/ML, and modern development frameworks",
        }
      case "certifications":
        return {
          title: "Professional Development",
          content:
            "Pursuing AWS Cloud Practitioner and Solutions Architect certifications • Advanced training in AI/ML integration with enterprise systems • Specialized coursework in system architecture and performance optimization • Regular participation in technology conferences and professional development workshops",
        }
      case "achievements":
        return {
          title: "Key Achievements",
          content:
            "Successfully migrated mission-critical banking applications serving thousands of daily users • Implemented zero-downtime deployment strategies for healthcare systems • Led cross-functional teams in delivering complex integration projects • Established code quality standards and review processes • Mentored junior developers and contributed to team knowledge sharing initiatives",
        }
      case "leadership":
        return {
          title: "Leadership Experience",
          content:
            "Co-Lead Developer role managing multiple concurrent projects • Technical team leadership and mentoring responsibilities • Cross-functional collaboration with product, marketing, and business stakeholders • Code review and quality assurance oversight • Training program development for new team members • Agile/Scrum process implementation and optimization",
        }
      case "technical":
        return {
          title: "Technical Expertise",
          content:
            "Advanced proficiency in enterprise software architecture • Database optimization and performance tuning • API design and microservices implementation • Cloud infrastructure management and deployment • Security best practices and compliance requirements • Integration with third-party systems and services • Automated testing and continuous integration",
        }
      case "management":
        return {
          title: "Project Management",
          content:
            "Agile/Scrum methodology implementation • Sprint planning and backlog management • Stakeholder communication and requirement gathering • Risk assessment and mitigation strategies • Resource allocation and timeline management • Quality assurance and delivery oversight • Team coordination and performance optimization",
        }
      case "strategy":
        return {
          title: "Strategic Initiatives",
          content:
            "Technology roadmap planning and implementation • Legacy system modernization strategies • AI integration and automation opportunities • Performance optimization and scalability planning • Cost reduction through efficient architecture design • Innovation initiatives and emerging technology adoption • Business process improvement through technology solutions",
        }
      default:
        return null
    }
  }

  // Keyboard controls: letter keys play notes, Shift modifies to sharp when available
  useEffect(() => {
    const isEditableTarget = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false
      const tag = el.tagName
      return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (isEditableTarget(e.target)) return
      const note = mapKeyToNote(e.key, e.shiftKey)
      if (!note) return
      const keyDef = pianoKeys.find((k) => k.note === note)
      const sectionId = keyDef ? sections.find((s) => s.label === keyDef.section)?.id : undefined
      playNote(note, sectionId)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <div className={"fixed inset-0 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-black flex flex-col items-center overflow-x-hidden overflow-y-auto"}>
      {/* (Orientation hint overlay removed for mobile) */}
      <div className={"sticky top-0 left-0 right-0 p-4 md:p-6 backdrop-blur-sm z-30 border-b bg-white/90 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800"}>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center max-w-7xl mx-auto w-full max-w-full overflow-x-hidden">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-1 text-neutral-950 dark:text-neutral-100 break-words">Justin Christopher Le</h1>
            <p className="text-neutral-600 dark:text-neutral-300 text-base md:text-lg mb-1 font-medium">Senior Software Engineer • Charlotte, NC</p>
            <div className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
              7+ Years Experience • Full-Stack Development • Enterprise Solutions
            </div>
          </div>
          <div className="flex gap-3 flex-col sm:flex-row w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="hidden sm:inline-flex border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 font-medium bg-transparent text-sm md:text-base px-3 py-2"
              onClick={() => {
                const current = resolvedTheme ?? theme
                setTheme(current === "dark" ? "light" : "dark")
              }}
              aria-label="Toggle theme"
            >
              {mounted ? ((resolvedTheme ?? theme) === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />) : <Moon className="w-4 h-4 mr-2" />}
              {mounted ? (((resolvedTheme ?? theme) === "dark") ? "Light Mode" : "Dark Mode") : "Toggle Theme"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hidden lg:inline-flex border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 font-medium bg-transparent text-sm md:text-base px-3 py-2"
            >
              <Phone className="w-4 h-4 mr-2" />
              704-996-9469
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hidden lg:inline-flex border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 font-medium bg-transparent text-sm md:text-base px-3 py-2"
            >
              <Mail className="w-4 h-4 mr-2" />
              JustinLe.Work@gmail.com
            </Button>
            <Button
              size="lg"
              className="hidden lg:inline-flex bg-indigo-600 text-white hover:bg-indigo-500 font-medium text-sm md:text-base"
              onClick={() => window.open("https://BuildAndServe.com", "_blank")}
            >
              <Building className="w-4 h-4 mr-2" />
              Build & Serve
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="sm:hidden w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 font-medium bg-transparent text-sm px-3 py-2"
              onClick={() => {
                const current = resolvedTheme ?? theme
                setTheme(current === "dark" ? "light" : "dark")
              }}
              aria-label="Toggle theme"
            >
              {mounted ? ((resolvedTheme ?? theme) === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />) : <Moon className="w-4 h-4 mr-2" />}
              {mounted ? (((resolvedTheme ?? theme) === "dark") ? "Light" : "Dark") : "Theme"}
            </Button>
            {/* Mobile/tablet second line for Email and Build & Serve */}
            <div className="lg:hidden w-full grid grid-cols-1 gap-2">
              <a
                href="mailto:JustinLe.Work@gmail.com"
                className="w-full flex items-center justify-center gap-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-[11px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-center whitespace-normal break-words break-all min-w-0 overflow-hidden"
              >
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="min-w-0 break-words break-all leading-snug text-center">JustinLe.Work@gmail.com</span>
              </a>
              <a
                href="https://BuildAndServe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 px-3 py-2 text-sm font-medium min-w-0 overflow-hidden"
              >
                <Building className="w-4 h-4" />
                <span className="flex-1 min-w-0 whitespace-nowrap truncate text-center leading-snug">Build &amp; Serve</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop/tablet keyboard (visible on large screens and up) */}
      <div className="hidden lg:flex items-center justify-center mt-6 md:mt-10">
        <div className={"bg-gradient-to-b from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 p-4 md:p-8 rounded-lg shadow-2xl border border-neutral-300 dark:border-neutral-700"}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-400 mb-2 tracking-wide">Professional Portfolio</h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm font-medium">Select a section to view details</p>
          </div>

          <div className="relative w-full overflow-x-hidden snap-x snap-mandatory" ref={keyboardWrapperRef}>
            <div
              ref={keyboardInnerRef}
              className="inline-flex justify-center gap-0 sm:gap-0.5 md:gap-1 lg:gap-2 px-0 origin-left"
              style={{ transform: `scale(${keyboardScale})`, transformOrigin: "left", willChange: "transform" }}
            >
              {pianoKeys.map((key, index) => (
                <PianoKey
                  key={index}
                  note={key.note}
                  isBlack={key.isBlack}
                  isPressed={pressedKeys.includes(key.note)}
                  section={key.section}
                  onClick={(event) => {
                    const section = sections.find((s) => s.label === key.section)
                    if (event) {
                      playNote(key.note, section?.id, event)
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile open keyboard button */}
      {!isMobileKeyboardOpen && (
        <button
          type="button"
          className="lg:hidden fixed left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 active:scale-95 transition"
          style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
          onClick={() => setIsMobileKeyboardOpen(true)}
          aria-label="Open keyboard"
        >
          <div className="flex items-center gap-2">
            <ChevronUp className="w-5 h-5" />
            <span className="text-sm font-semibold">Open Keyboard</span>
          </div>
        </button>
      )}

      {/* Mobile slide-up keyboard panel */}
      {isMobileKeyboardOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-20 bg-black/30"
            onClick={() => setIsMobileKeyboardOpen(false)}
            aria-hidden="true"
          />
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-30">
            <div className="w-full">
              <div className="rounded-t-2xl border border-neutral-300 dark:border-neutral-700 bg-gradient-to-b from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 shadow-2xl max-h-[70vh] overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div className="mx-auto h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <button
                    type="button"
                    className="absolute right-3 top-2 rounded-md px-2 py-1 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => setIsMobileKeyboardOpen(false)}
                    aria-label="Close keyboard"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-0 sm:px-4 pb-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
                  <div className="text-center mb-4 px-4 sm:px-0">
                    <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-300 tracking-wide">Professional Portfolio</h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-xs font-medium">Select a section to view details</p>
                  </div>
                  <div className="relative w-full overflow-x-hidden snap-x snap-mandatory" ref={keyboardWrapperRef}>
                    <div
                      ref={keyboardInnerRef}
                      className="inline-flex justify-center gap-0 sm:gap-0.5 md:gap-1 lg:gap-2 px-0 origin-left"
                      style={{ transform: `scale(${keyboardScale})`, transformOrigin: "left", willChange: "transform" }}
                    >
                      {pianoKeys.map((key, index) => (
                        <PianoKey
                          key={index}
                          note={key.note}
                          isBlack={key.isBlack}
                          isPressed={pressedKeys.includes(key.note)}
                          section={key.section}
                          onClick={(event) => {
                            const section = sections.find((s) => s.label === key.section)
                            if (event) {
                              playNote(key.note, section?.id, event)
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeSection && (
        <>
          <div
            className="fixed inset-0 z-30 cursor-pointer"
            onMouseDown={(e) => {
              if (e.button === 0) setActiveSection(null)
            }}
          />
          <div className="fixed bottom-2 md:bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-in slide-in-from-bottom-2 duration-300 fade-in w-[92vw] md:w-auto">
            <div
              className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-4 md:p-8 max-w-[92vw] md:max-w-4xl mx-auto shadow-xl max-h-[80vh] overflow-y-auto"
              onMouseDown={(e) => {
                if (e.button === 0) setActiveSection(null)
              }}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors duration-200"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {(() => {
                const content = getSectionContent(activeSection)
                const section = sections.find((s) => s.id === activeSection)
                const IconComponent = section?.icon || User
                return content ? (
                  <div className="text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <IconComponent className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                      <h3 className="text-xl font-semibold text-black dark:text-neutral-100">{content.title}</h3>
                    </div>
                    {(() => {
                      const items = (content.content || "")
                        .split("•")
                        .map((t) => t.trim())
                        .filter(Boolean)
                      return items.length > 1 ? (
                        <ul className="list-disc pl-5 md:pl-6 space-y-1.5 text-neutral-800 dark:text-neutral-400 leading-relaxed font-medium max-w-3xl">
                          {items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-neutral-800 dark:text-neutral-400 leading-relaxed font-medium max-w-3xl">
                          {content.content}
                        </p>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-neutral-500">Content not available</p>
                  </div>
                )
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
