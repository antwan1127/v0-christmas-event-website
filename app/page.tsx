"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Volume2, VolumeX } from "lucide-react"
import Image from "next/image"

function ChristmasTree() {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={[0, -1, 0]}>
        {/* Tree cone layers */}
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[1.5, 2, 8]} />
          <meshStandardMaterial color="#1a4d1a" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <coneGeometry args={[1.2, 1.8, 8]} />
          <meshStandardMaterial color="#1f5c1f" />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <coneGeometry args={[0.9, 1.5, 8]} />
          <meshStandardMaterial color="#267326" />
        </mesh>
        {/* Tree trunk */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.8]} />
          <meshStandardMaterial color="#3d2817" />
        </mesh>
        {/* Star on top */}
        <mesh position={[0, 3.5, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={2} />
        </mesh>
        {[...Array(15)].map((_, i) => (
          <mesh
            key={i}
            position={[Math.sin(i * 0.6) * (1.3 - i * 0.08), i * 0.3 - 0.5, Math.cos(i * 0.6) * (1.3 - i * 0.08)]}
          >
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#dc2626" : i % 3 === 1 ? "#ffd700" : "#ffffff"}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        ))}
        {[...Array(20)].map((_, i) => (
          <mesh
            key={`light-${i}`}
            position={[Math.sin(i * 0.5) * (1.1 - i * 0.05), i * 0.25, Math.cos(i * 0.5) * (1.1 - i * 0.05)]}
          >
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#ffff00" : "#ffffff"}
              emissive={i % 2 === 0 ? "#ffff00" : "#ffffff"}
              emissiveIntensity={1.5}
            />
          </mesh>
        ))}
      </group>
    </Float>
  )
}

function Snowflakes() {
  return (
    <>
      {[...Array(50)].map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 20, Math.random() * 10, (Math.random() - 0.5) * 20]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </>
  )
}

export default function HollyJollyPage() {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [assignedInstapayUser, setAssignedInstapayUser] = useState("")
  const [formData, setFormData] = useState({
    eventType: "",
    gender: "",
    fullName: "",
    email: "",
    phone: "",
    age: "",
    dietaryRestrictions: "",
    emergencyContact: "",
    paymentMethod: "",
    instapayDetails: "",
    cashPickupTime: "", // Added field for cash pickup time selection
  })
  const audioRef = useRef<HTMLAudioElement>(null)

  // Instapay users array
  const instapayUsers = [
    "Beyaminghobrial@instapay",
    "jssss@instapay", 
    "Karenamir@instapay",
    "Kerminamagedqnb@instapay"
  ]

  // Assign Instapay user on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * instapayUsers.length)
    setAssignedInstapayUser(instapayUsers[randomIndex])
  }, [])

  useEffect(() => {
    // Auto-play music on mount
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Auto-play might be blocked by browser
        setIsMusicPlaying(false)
      })
      setIsMusicPlaying(true)
    }
  }, [])

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsMusicPlaying(!isMusicPlaying)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // For numeric fields (age, dietaryRestrictions, emergencyContact), only allow numbers
    if (name === 'age' || name === 'dietaryRestrictions' || name === 'emergencyContact') {
      // Only allow numbers and empty string
      if (value === '' || /^\d+$/.test(value)) {
        setFormData({ ...formData, [name]: value })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const validateThreeWords = (text: string) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    return words.length === 3
  }

  const validateForm = () => {
    // Check required fields
    if (!formData.eventType) {
      alert("يرجى اختيار اسم الكنيسة")
      return false
    }
    if (!formData.gender) {
      alert("يرجى اختيار جنس الطفل")
      return false
    }
    if (!formData.paymentMethod) {
      alert("يرجى اختيار طريقة الدفع")
      return false
    }
    
    // Check if questions 3, 4, 5 have exactly 3 words
    if (!validateThreeWords(formData.fullName)) {
      alert("اسم الطفل يجب أن يكون ثلاثي (3 كلمات)")
      return false
    }
    if (!validateThreeWords(formData.email)) {
      alert("اسم الاب يجب أن يكون ثلاثي (3 كلمات)")
      return false
    }
    if (!validateThreeWords(formData.phone)) {
      alert("اسم الام يجب أن يكون ثلاثي (3 كلمات)")
      return false
    }
    
    // Check if numeric fields are not empty
    if (!formData.age || formData.age === '') {
      alert("رقم تليفون الاب/الام مطلوب")
      return false
    }
    if (!formData.dietaryRestrictions || formData.dietaryRestrictions === '') {
      alert("عدد الاخوات مطلوب")
      return false
    }
    if (!formData.emergencyContact || formData.emergencyContact === '') {
      alert("عدد التذاكر المطلوبة مطلوب")
      return false
    }
    
    // Check payment method specific fields
    if (formData.paymentMethod === "instapay" && !formData.instapayDetails) {
      alert("يرجى إدخال رقم المعاملة")
      return false
    }
    if (formData.paymentMethod === "cash" && !formData.cashPickupTime) {
      alert("يرجى اختيار وقت استلام النقود")
      return false
    }
    
    return true
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      return
    }
    
    // Ensure Instapay user is assigned
    if (formData.paymentMethod === "instapay" && !assignedInstapayUser) {
      alert("Please wait a moment for payment details to load, then try again.")
      return
    }
    
    setIsSubmitting(true)

    try {
      const GOOGLE_SHEETS_URL =
        "https://script.google.com/macros/s/AKfycbyfV85RggMUGUjmG8L3l1aRbH6vbiI4aPCWK3oxb62zhxm9OEUgm4snNVwEF_mf1kaD/exec"

      // Prepare the payment info
      let paymentInfo = ""
      if (formData.paymentMethod === "instapay") {
        paymentInfo = `Instapay - ${assignedInstapayUser} - ${formData.instapayDetails}`
      } else {
        paymentInfo = `Cash - ${formData.cashPickupTime}`
      }

      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question1: formData.eventType,
          question2: formData.gender,
          question3: formData.fullName,
          question4: formData.email,
          question5: formData.phone,
          question6: formData.age,
          question7: formData.dietaryRestrictions || "None",
          question8: formData.emergencyContact,
          question9: paymentInfo,
        }),
      })

      // Since we're using no-cors mode, we can't check response status
      // But we'll assume success if no error is thrown
      setShowSuccessModal(true)
      setFormData({
        eventType: "",
        gender: "",
        fullName: "",
        email: "",
        phone: "",
        age: "",
        dietaryRestrictions: "",
        emergencyContact: "",
        paymentMethod: "",
        instapayDetails: "",
        cashPickupTime: "",
      })
    } catch (error) {
      console.error("[v0] Error submitting form:", error)
      alert("There was an error submitting your registration. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const eventImages = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20251007-WA0001-dvl4Rw46h1gT7dJl47VZ5NrXUrGjHE.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-07%20at%2017.16.52_069618b9-TL7a1yp6zKmDbihta2BmtyVPh5LEfI.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-07%20at%2017.16.52_155b1bee-Zx0jRkgpM7gb5m8vb4RtXtWdaP9SmK.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20251007-WA0005-0pCdWuZedlFirtacoInzAUufZUtdVm.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-07%20at%2017.16.52_52c832fb-nVWdPgSd0IeXuGso2IdcR8BJc2LjXZ.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20251007-WA0004-WPkqwFtsItSNQQccy18UygiDJjsCXs.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-07%20at%2017.16.52_193cbdf7-Yv2ENpAsmhVnpjsAxj3L1Y1jobwvUf.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20251007-WA0002-f8NsI7AXugFTZ9mXJVgsOXGL7rDL4Z.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20251007-WA0003-3SqPrAyvN7KPpc5RzpoimF7YkCZJtm.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-07%20at%2017.57.29_15e47db3-0v7kKcnoSYsTxQNzOf5wF2KDCE8sQa.jpg",
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      {/* Elegant Wooden Frame */}
      <div className="fixed inset-0 pointer-events-none z-30">
        {/* Top border */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 shadow-sm"></div>
        
        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 shadow-sm"></div>
        
        {/* Left border */}
        <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300 shadow-sm"></div>
        
        {/* Right border */}
        <div className="absolute top-0 bottom-0 right-0 w-3 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300 shadow-sm"></div>
        
        {/* Corner accents */}
        <div className="absolute top-4 left-4 w-3 h-3 border-2 border-amber-500 rounded-sm"></div>
        <div className="absolute top-4 right-4 w-3 h-3 border-2 border-amber-500 rounded-sm"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 border-2 border-amber-500 rounded-sm"></div>
        <div className="absolute bottom-4 right-4 w-3 h-3 border-2 border-amber-500 rounded-sm"></div>
        
        {/* Subtle inner shadow */}
        <div className="absolute top-3 left-3 right-3 bottom-3 border border-amber-200 opacity-60"></div>
        
        {/* Decorative images hovering over the border */}
        {/* Top side decorations */}
        <div className="absolute top-1 left-1/4 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" style={{ animationDuration: '3s' }}>
          <Image src="/images/design-mode/star.png" alt="Star decoration" width={24} height={24} className="opacity-80" />
        </div>
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }}>
          <Image src="/images/design-mode/tree.png" alt="Tree decoration" width={28} height={28} className="opacity-80" />
        </div>
        <div className="absolute top-1 left-3/4 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
          <Image src="/images/design-mode/star.png" alt="Star decoration" width={22} height={22} className="opacity-80" />
        </div>
        
        {/* Right side decorations */}
        <div className="absolute right-1 top-1/4 transform translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}>
          <Image src="/images/design-mode/cone.png" alt="Cone decoration" width={26} height={26} className="opacity-80" />
        </div>
        <div className="absolute right-1 top-1/2 transform translate-x-1/2 -translate-y-1/2 animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1.5s' }}>
          <Image src="/images/design-mode/boy.png" alt="Boy decoration" width={30} height={30} className="opacity-80" />
        </div>
        <div className="absolute right-1 top-3/4 transform translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.8s' }}>
          <Image src="/images/design-mode/hood.png" alt="Hood decoration" width={24} height={24} className="opacity-80" />
        </div>
        
        {/* Bottom side decorations */}
        <div className="absolute bottom-1 left-1/4 transform -translate-x-1/2 translate-y-1/2 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '1.2s' }}>
          <Image src="/images/design-mode/tree.png" alt="Tree decoration" width={26} height={26} className="opacity-80" />
        </div>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '2.5s' }}>
          <Image src="/images/design-mode/star.png" alt="Star decoration" width={20} height={20} className="opacity-80" />
        </div>
        <div className="absolute bottom-1 left-3/4 transform -translate-x-1/2 translate-y-1/2 animate-bounce" style={{ animationDuration: '2.7s', animationDelay: '0.3s' }}>
          <Image src="/images/design-mode/cone.png" alt="Cone decoration" width={28} height={28} className="opacity-80" />
        </div>
        
        {/* Left side decorations */}
        <div className="absolute left-1 top-1/4 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '1.8s' }}>
          <Image src="/images/design-mode/hood.png" alt="Hood decoration" width={26} height={26} className="opacity-80" />
        </div>
        <div className="absolute left-1 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.7s' }}>
          <Image src="/images/design-mode/boy.png" alt="Boy decoration" width={32} height={32} className="opacity-80" />
        </div>
        <div className="absolute left-1 top-3/4 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2.2s' }}>
          <Image src="/images/design-mode/star.png" alt="Star decoration" width={24} height={24} className="opacity-80" />
        </div>
        
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" style={{ animationDuration: '2.3s', animationDelay: '0.9s' }}>
          <Image src="/images/design-mode/tree.png" alt="Tree decoration" width={20} height={20} className="opacity-70" />
        </div>
        <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '1.6s' }}>
          <Image src="/images/design-mode/star.png" alt="Star decoration" width={18} height={18} className="opacity-70" />
        </div>
        <div className="absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2 animate-bounce" style={{ animationDuration: '2.9s', animationDelay: '1.4s' }}>
          <Image src="/images/design-mode/cone.png" alt="Cone decoration" width={22} height={22} className="opacity-70" />
        </div>
        <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '0.6s' }}>
          <Image src="/images/design-mode/hood.png" alt="Hood decoration" width={20} height={20} className="opacity-70" />
        </div>
      </div>
      <audio ref={audioRef} loop>
        <source
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Audio%202025-10-07%20at%2018.50.55_c990cb06-SGaDMfkyQ7bBleT977NKxRQqURi9rR.mp3"
          type="audio/mpeg"
        />
      </audio>

      {/* Music control button */}
      <button
        onClick={toggleMusic}
        className="fixed top-6 right-6 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
        aria-label="Toggle music"
      >
        {isMusicPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>


      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="snowflake absolute text-white text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 3 + 5}s`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${Math.random() * 10 + 10}px`,
            }}
          >
            ❄
          </div>
        ))}
      </div>

      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(15)].map((_, i) => (
          <div
            key={`ornament-${i}`}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 2 + 3}s`,
              animationDelay: `${Math.random() * 2}s`,
              width: `${Math.random() * 40 + 30}px`,
              height: `${Math.random() * 40 + 30}px`,
            }}
          >
            <Image
              src={i % 3 === 0 ? "/images/design-mode/tree.png" : i % 3 === 1 ? "/images/design-mode/cone.png" : "/images/design-mode/star.png"}
              alt="Christmas decoration"
              width={60}
              height={60}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      <div className="fixed left-4 top-1/4 z-10 pointer-events-none animate-pulse">
        <Image
          src="/images/design-mode/boy.png"
          alt="Christmas boy"
          width={80}
          height={80}
          className="w-20 h-20 object-contain"
        />
      </div>
      <div className="fixed right-4 top-1/3 z-10 pointer-events-none animate-pulse" style={{ animationDelay: "1s" }}>
        <Image
          src="/images/design-mode/hood.png"
          alt="Christmas hood"
          width={80}
          height={80}
          className="w-20 h-20 object-contain"
        />
      </div>

      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(30)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 2 + 1}s`,
              animationDelay: `${Math.random() * 2}s`,
              width: `${Math.random() * 20 + 15}px`,
              height: `${Math.random() * 20 + 15}px`,
            }}
          >
            <Image
              src="/images/design-mode/star.png"
              alt="Twinkling star"
              width={35}
              height={35}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      <div className="fixed top-0 left-0 right-0 z-20 h-12 flex justify-around items-center pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full animate-pulse"
            style={{
              backgroundColor: i % 3 === 0 ? "#dc2626" : i % 3 === 1 ? "#ffd700" : "#ffffff",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Section with 3D Scene */}
      <section className="relative h-screen flex items-center justify-center pt-4 pb-4 pl-4 pr-4">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} />
            <ChristmasTree />
            <Snowflakes />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            <Environment preset="sunset" />
          </Canvas>
        </div>

        <div className="relative z-20 text-center px-4">
          <div className="mb-8 float-animation">
            <Image
              src="/images/design-mode/final-logo-01.png"
              alt="Holly Jolly Logo"
              width={400}
              height={400}
              className="mx-auto drop-shadow-2xl"
              priority
            />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-red-600 mb-12 drop-shadow-lg leading-tight">
            Welcome to
            <br />
            Holly Jolly!
          </h1>
        </div>
      </section>

      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-primary mb-8 leading-tight">
            A Magical
            <br />
            Christmas Celebration
          </h2>
          <p className="text-2xl text-gray-700">Join us for an unforgettable holiday experience!</p>
        </div>
      </section>

      <section id="gallery" className="py-20 px-4 relative">
        {/* Logo watermark background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <Image
            src="/images/design-mode/final-logo-01.png"
            alt="Holly Jolly Logo Background"
            width={600}
            height={600}
            className="object-contain"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold text-center text-primary mb-6">Memories from Last Year</h2>
          <p className="text-center text-2xl text-gray-700 mb-12">
            Relive the joy and magic of our previous celebration!
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16 max-w-6xl mx-auto">
            {eventImages.slice(0, 6).map((src, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:scale-105 transition-transform duration-300 slide-in-up shadow-lg bg-white/90 backdrop-blur-sm border-2 border-primary/20 w-80"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={src || "/placeholder.svg"}
                      alt={`Event photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mb-16">
            <Card className="shadow-2xl border-4 border-primary bg-white">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-5xl font-bold text-primary mb-4">Register Now!</h2>
                  <p className="text-xl text-gray-700">
                    Secure your spot at this year's Holly Jolly celebration
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Event Information */}
                  <div className="bg-gradient-to-r from-red-50 to-green-50 border-2 border-primary/20 rounded-lg p-6 mb-6">
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold text-primary mb-2">🎄 Holly Jolly 🎄</h3>
                      <p className="text-lg text-gray-700 font-semibold">يوم رياضي لأطفال ابتدائي وأسرهم</p>
                    </div>
                    
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-start space-x-2">
                        <span className="text-primary font-bold">📍</span>
                        <span>تابع لكنيسة مارمرقس مصر الجديدة وتحت إشراف أسرة القديس أبسخيرون القليني</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="text-primary font-bold">🏫</span>
                        <span>سيقام في الـ College de la Salle بالتجمع</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="text-primary font-bold">📅</span>
                        <span>الجمعة ٢٦ من ديسمبر ٢٠٢٥</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-white/80 rounded-lg border border-primary/30">
                      <h4 className="text-lg font-bold text-primary mb-3 text-center">الشروط والأحكام</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span>آخر ميعاد للحجز واسترداد الفلوس ٢١ ديسمبر</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span>الدخول بالتذاكر لنفس الأشخاص المسجلين في الفورم (ممنوع استبدال التذاكر)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-green-500 font-bold">•</span>
                          <span>نرحب بعائلة الطفل (أب وأم وأخوات فقط)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span>نعتذر لا يوجد تذاكر يوم الحفلة على الباب</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-800">1. اسم الكنيسة *</Label>
                    <RadioGroup
                      value={formData.eventType}
                      onValueChange={(value) => handleRadioChange("eventType", value)}
                      required
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="church1" id="church1" />
                        <Label htmlFor="church1" className="font-normal cursor-pointer text-gray-800">
                          مارمرقس م.الجديده مدارس احد
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="church2" id="church2" />
                        <Label htmlFor="church2" className="font-normal cursor-pointer text-gray-800">
                          مارمرقس م.الجديده اجتماع
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="church3" id="church3" />
                        <Label htmlFor="church3" className="font-normal cursor-pointer text-gray-800">
                          العذارء ارض الجولف
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="church4" id="church4" />
                        <Label htmlFor="church4" className="font-normal cursor-pointer text-gray-800">
                          الكاروز التجمع
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="church5" id="church5" />
                        <Label htmlFor="church5" className="font-normal cursor-pointer text-gray-800">
                          العذارء و الانبا بيشوي التجمع
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="church6" id="church6" />
                        <Label htmlFor="church6" className="font-normal cursor-pointer text-gray-800">
                          العذارء الرحاب
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="church7" id="church7" />
                        <Label htmlFor="church7" className="font-normal cursor-pointer text-gray-800">
                          العذارء و مارجرجس مدينتي
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-lg font-semibold text-gray-800">
                      2. اسم الطفل (في المرحله الابتدائية ) ثلاثي بالعربي *
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="text-lg text-gray-800"
                      placeholder=""
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-lg font-semibold text-gray-800">
                      3. Gender *
                    </Label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleSelectChange}
                      required
                      className="w-full px-3 py-2 text-lg text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-lg font-semibold text-gray-800">
                      4. اسم الاب ثلاثي بالعربي*
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="text"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="text-lg text-gray-800"
                      placeholder=""
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-lg font-semibold text-gray-800">
                      5. اسم الام ثلاثي بالعربي*
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="text-lg text-gray-800"
                      placeholder=""
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-lg font-semibold text-gray-800">
                      6. رقم تليفون الاب/الام *
                    </Label>
                    <Input
                      id="age"
                      name="age"
                      type="tel"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                      className="text-lg text-gray-800"
                      placeholder=""
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dietaryRestrictions" className="text-lg font-semibold text-gray-800">
                      7. عدد الاخوات *
                    </Label>
                    <Input
                      id="dietaryRestrictions"
                      name="dietaryRestrictions"
                      type="number"
                      value={formData.dietaryRestrictions}
                      onChange={handleInputChange}
                      required
                      className="text-lg text-gray-800"
                      placeholder=""
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="text-lg font-semibold text-gray-800">
                      8. عدد التذاكر المطلوبة *
                    </Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      type="number"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      required
                      className="text-lg text-gray-800"
                      placeholder=""
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-800">9. Payment Method *</Label>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleRadioChange("paymentMethod", value)}
                      required
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="font-normal cursor-pointer text-gray-800">
                          Cash
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="instapay" id="instapay" />
                        <Label htmlFor="instapay" className="font-normal cursor-pointer text-gray-800">
                          Instapay
                        </Label>
                      </div>
                    </RadioGroup>

                    {formData.paymentMethod === "cash" && (
                      <div className="mt-4 space-y-4 p-4 bg-white/90 rounded-lg border-2 border-primary/30">
                        <p className="text-base text-black font-bold text-center">
                          هنجمع الاشتراكات ابتداء من ٢ نوفمبر
                        </p>
                        <p className="text-sm text-black font-semibold">Please select your preferred pickup time:</p>
                        <RadioGroup
                          value={formData.cashPickupTime}
                          onValueChange={(value) => handleRadioChange("cashPickupTime", value)}
                          required
                        >
                          <div className="flex items-center space-x-2 p-3 bg-white rounded border border-primary/20">
                            <RadioGroupItem value="friday" id="friday" />
                            <Label
                              htmlFor="friday"
                              className="font-normal cursor-pointer text-black text-sm leading-relaxed"
                            >
                              الجمعه من ١٠ص ل ١ظ في المبني الجديد +بين الفيلتين في الكنيسة الرئيسية
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 bg-white rounded border border-primary/20">
                            <RadioGroupItem value="sunday" id="sunday" />
                            <Label
                              htmlFor="sunday"
                              className="font-normal cursor-pointer text-black text-sm leading-relaxed"
                            >
                              الاحد من ٥ م ل ٢ م في المبني الجديد +بين الفليتين في الكنيسة الرئيسية
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {formData.paymentMethod === "instapay" && (
                      <div className="mt-4 space-y-4 p-4 bg-white/90 rounded-lg border-2 border-primary/30">
                        <div className="text-center mb-4">
                          <p className="text-lg font-semibold text-primary mb-2">Payment Instructions</p>
                          <p className="text-sm text-gray-700">
                            Please send payment to: <span className="font-bold text-primary">
                              {assignedInstapayUser || "Loading..."}
                            </span>
                          </p>
                        </div>
                        <div className="relative h-80 w-full max-w-lg mx-auto rounded-lg overflow-hidden border-2 border-primary/50">
                          <Image
                            src="/instapay.jpg"
                            alt="Instapay QR Code for payment"
                            fill
                            className="object-contain bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instapayDetails" className="text-base font-semibold text-black">
                            Enter your transaction reference number *
                          </Label>
                          <Input
                            id="instapayDetails"
                            name="instapayDetails"
                            value={formData.instapayDetails}
                            onChange={handleInputChange}
                            required={formData.paymentMethod === "instapay"}
                            className="text-lg text-gray-800"
                            placeholder=""
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6 rounded-full shadow-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Registration 🎄"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {eventImages.slice(6).map((src, index) => (
              <Card
                key={index + 6}
                className="overflow-hidden hover:scale-105 transition-transform duration-300 slide-in-up shadow-lg bg-white/90 backdrop-blur-sm border-2 border-primary/20"
                style={{ animationDelay: `${(index + 6) * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={src || "/placeholder.svg"}
                      alt={`Event photo ${index + 5}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-800 py-12 px-4 border-t-2 border-primary">
        <div className="max-w-7xl mx-auto text-center">
          <Image
            src="/images/design-mode/final-logo-01.png"
            alt="Holly Jolly Logo"
            width={150}
            height={150}
            className="mx-auto mb-6"
          />
          <h3 className="text-3xl font-bold mb-4 text-primary">Holly Jolly Christmas Event</h3>
          <p className="text-xl mb-2 text-gray-600">Spreading joy and Christmas cheer!</p>
          <p className="text-lg opacity-90">© 2025 Holly Jolly. All rights reserved. 🎅🎄✨</p>
        </div>
      </footer>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl animate-bounceIn">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-primary mb-2">🎉 تم التسجيل بنجاح! 🎉</h2>
              <p className="text-lg text-gray-700 mb-4">Thank you for registering for Holly Jolly!</p>
              <p className="text-sm text-gray-600">Your registration has been saved successfully.</p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
