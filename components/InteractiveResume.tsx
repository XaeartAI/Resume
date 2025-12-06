"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Code, Building, Award, User, Briefcase, GraduationCap } from "lucide-react"

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
  const labelMap: Record<string, string> = {
    Certifications: "Certs",
    Leadership: "Leader",
    Management: "Mgmt",
  }
  const displaySection = section ? (labelMap[section] ?? section) : section
  const isLeadership = displaySection === "Leadership"
  const labelSizeClass = isBlack ? (isLeadership ? "text-[12px]" : "text-[11px]") : (isLeadership ? "text-[12px]" : "text-[12px]")
  return (
    <div
      className={`
        ${
          isBlack
            ? "bg-gradient-to-b from-neutral-900 to-black text-white w-14 h-40 -mx-3 transform-gpu -translate-y-8 z-20 relative shadow-2xl border border-neutral-700 rounded-md"
            : "bg-gradient-to-b from-white to-neutral-50 text-neutral-900 w-24 h-64 z-10 border border-neutral-200 shadow-lg rounded-b-md"
        }
        ${isPressed ? (isBlack ? "from-slate-700 to-slate-900 shadow-inner scale-[0.98]" : "from-gray-100 to-gray-200 shadow-inner scale-[0.98]") : ""}
        flex flex-col items-center justify-end pb-6 cursor-pointer
        transition-all duration-150 ease-out hover:shadow-xl
        ${isBlack ? "hover:from-neutral-800 hover:to-neutral-900" : "hover:from-neutral-50 hover:to-white"}
        rounded-b-sm relative overflow-hidden min-w-0
      `}
      onClick={onClick}
    >
      {section && (
        <div className="text-center mb-4">
          <div
            className={`font-semibold ${labelSizeClass} normal-case tracking-normal px-3 py-1.5 max-w-full overflow-hidden whitespace-normal break-words hyphens-auto text-center leading-snug shadow-sm ${
              isBlack ? "text-white bg-white/20 border border-white/25 rounded-md" : "text-neutral-800 bg-black/10 border border-black/10 rounded-md"
            } ${isPressed ? "opacity-100" : "opacity-90"} transition-all duration-150`}
            title={section}
          >
            {displaySection}
          </div>
        </div>
      )}

      <span
        className={`relative z-10 font-bold ${isBlack ? "text-base" : "text-lg"} block w-full text-center leading-tight select-none pointer-events-none px-1 ${
          isBlack ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]" : "text-neutral-900"
        } ${isPressed ? "scale-95" : ""} transition-transform duration-150`}
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

  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
    }

    const handleFirstInteraction = () => {
      initAudio()
      document.removeEventListener("click", handleFirstInteraction)
    }

    document.addEventListener("click", handleFirstInteraction)
    return () => document.removeEventListener("click", handleFirstInteraction)
  }, [])

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

  const playNote = (note: string, sectionId?: string, event?: React.MouseEvent) => {
    setPressedKeys((prev) => [...prev, note])

    if (sectionId) {
      setActiveSection(sectionId)
    }

    if (audioContextRef.current) {
      const audioContext = audioContextRef.current
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

  useEffect(() => {
    if (!activeSection) return
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        closeModal()
      }
    }
    document.addEventListener("mousedown", handleMouseDown)
    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
    }
  }, [activeSection])

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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-200">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-1 text-slate-900 whitespace-nowrap">Justin Christopher Le</h1>
            <p className="text-slate-600 text-lg mb-1 font-medium">Senior Software Engineer • Charlotte, NC</p>
            <div className="text-slate-500 text-sm font-medium">
              7+ Years Experience • Full-Stack Development • Enterprise Solutions
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              size="lg"
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-medium bg-transparent"
            >
              <Phone className="w-4 h-4 mr-2" />
              704-996-9469
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-medium bg-transparent"
            >
              <Mail className="w-4 h-4 mr-2" />
              JustinLe.Work@gmail.com
            </Button>
            <Button
              size="lg"
              className="bg-slate-900 text-white hover:bg-slate-800 font-medium"
              onClick={() => window.open("https://BuildAndServe.com", "_blank")}
            >
              <Building className="w-4 h-4 mr-2" />
              Build & Serve
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 p-8 rounded-lg shadow-2xl border border-neutral-700">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2 tracking-wide">Professional Portfolio</h2>
            <p className="text-neutral-300 text-sm font-medium">Select a section to view details</p>
          </div>

          <div className="flex relative justify-center gap-1">
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

      {activeSection && (
        <>
          <div
            className="fixed inset-0 z-30 cursor-pointer"
            onMouseDown={(e) => {
              if (e.button === 0) closeModal()
            }}
          />
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-in slide-in-from-bottom-2 duration-300 fade-in">
            <div
              className="bg-white border border-gray-300 rounded-lg p-8 max-w-4xl mx-auto shadow-xl"
              onMouseDown={(e) => {
                if (e.button === 0) closeModal()
              }}
            >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-slate-600 transition-colors duration-200"
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
                    <IconComponent className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-semibold text-slate-900">{content.title}</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium max-w-3xl">{content.content}</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-slate-500">Content not available</p>
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


