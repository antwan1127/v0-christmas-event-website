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
  const [formData, setFormData] = useState({
    eventType: "",
    referralSource: "",
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
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const GOOGLE_SHEETS_URL =
        "https://script.google.com/macros/s/AKfycbyfV85RggMUGUjmG8L3l1aRbH6vbiI4aPCWK3oxb62zhxm9OEUgm4snNVwEF_mf1kaD/exec"

      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question1: formData.eventType,
          question2: formData.referralSource,
          question3: formData.fullName,
          question4: formData.email,
          question5: formData.phone,
          question6: formData.age,
          question7: formData.dietaryRestrictions || "None",
          question8: formData.emergencyContact,
          question9:
            formData.paymentMethod === "instapay"
              ? `Instapay - ${formData.instapayDetails}`
              : `Cash - ${formData.cashPickupTime}`,
        }),
      })

      alert("Thank you for registering for Holly Jolly! Your registration has been saved.")
      setFormData({
        eventType: "",
        referralSource: "",
        fullName: "",
        email: "",
        phone: "",
        age: "",
        dietaryRestrictions: "",
        emergencyContact: "",
        paymentMethod: "",
        instapayDetails: "",
        cashPickupTime: "", // Reset cash pickup time
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
    <div className="min-h-screen bg-gradient-to-b from-black via-red-950 to-black overflow-hidden">
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
              fontSize: `${Math.random() * 20 + 20}px`,
            }}
          >
            {i % 3 === 0 ? "🎄" : i % 3 === 1 ? "🎁" : "⭐"}
          </div>
        ))}
      </div>

      <div className="fixed left-4 top-1/4 z-10 pointer-events-none animate-pulse">
        <div className="text-8xl">🍬</div>
      </div>
      <div className="fixed right-4 top-1/3 z-10 pointer-events-none animate-pulse" style={{ animationDelay: "1s" }}>
        <div className="text-8xl">🍬</div>
      </div>

      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(30)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute text-yellow-300 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 2 + 1}s`,
              animationDelay: `${Math.random() * 2}s`,
              fontSize: `${Math.random() * 15 + 10}px`,
            }}
          >
            ✨
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
      <section className="relative h-screen flex items-center justify-center">
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
              src="/images/design-mode/final%20Logo%20-01.png"
              alt="Holly Jolly Logo"
              width={400}
              height={400}
              className="mx-auto drop-shadow-2xl"
              priority
            />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-12 drop-shadow-lg leading-tight">
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
          <p className="text-2xl text-red-200">Join us for an unforgettable holiday experience!</p>
        </div>
      </section>

      <section id="gallery" className="py-20 px-4 relative">
        {/* Logo watermark background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <Image
            src="/images/design-mode/final%20Logo%20-01.png"
            alt="Holly Jolly Logo Background"
            width={600}
            height={600}
            className="object-contain"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold text-center text-primary mb-6">Memories from Last Year</h2>
          <p className="text-center text-2xl text-red-200 mb-12">
            Relive the joy and magic of our previous celebration!
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
            {eventImages.slice(0, 4).map((src, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:scale-105 transition-transform duration-300 slide-in-up shadow-lg bg-black/60 backdrop-blur-sm border-2 border-primary/20"
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
            <Card className="shadow-2xl border-4 border-primary bg-card">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-5xl font-bold text-primary mb-4">Register Now!</h2>
                  <p className="text-xl text-card-foreground">
                    Secure your spot at this year's Holly Jolly celebration
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-card-foreground">1. اسم الكنيسة *</Label>
                    <RadioGroup
                      value={formData.eventType}
                      onValueChange={(value) => handleRadioChange("eventType", value)}
                      required
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="church1" id="church1" />
                        <Label htmlFor="church1" className="font-normal cursor-pointer">
                          كنيسة العذراءمارمرقس م.الجديده مدارس احد
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="church2" id="church2" />
                        <Label htmlFor="church2" className="font-normal cursor-pointer">
                          كنيسة مارجرجس مارمرقس م.الجديده اجتماع
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="church3" id="church3" />
                        <Label htmlFor="church3" className="font-normal cursor-pointer">
                          الكاروز التجمع
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="church3" id="church3" />
                        <Label htmlFor="church3" className="font-normal cursor-pointer">
                          العذارء و الانبا بيشوي التجمع
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="church3" id="church3" />
                        <Label htmlFor="church3" className="font-normal cursor-pointer">
                          العذارء الرحاب
                        </Label>
                      </div>
                       <div className="flex items-center space-x-2">
                        <RadioGroupItem value="church3" id="church3" />
                        <Label htmlFor="church3" className="font-normal cursor-pointer">
                          العذارء و مارجر  جس مدينتي
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-card-foreground">2. الاسرة/الاجتماع *</Label>
                    <RadioGroup
                      value={formData.referralSource}
                      onValueChange={(value) => handleRadioChange("referralSource", value)}
                      required
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="grade1-abrar" id="grade1-abrar" />
                        <Label htmlFor="grade1-abrar" className="font-normal cursor-pointer">
                          اولي ابتدائي(اسرة ابرار)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="grade2-abrar" id="grade2-abrar" />
                        <Label htmlFor="grade2-abrar" className="font-normal cursor-pointer">
                          تانية ابتدائي (اسرة ابرار)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="grade3-fathers" id="grade3-fathers" />
                        <Label htmlFor="grade3-fathers" className="font-normal cursor-pointer">
                          ثالثة ابتدائي(اسرة اباء)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="grade4-fathers" id="grade4-fathers" />
                        <Label htmlFor="grade4-fathers" className="font-normal cursor-pointer">
                          رابعه ابتدائي(اسرة اباء)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="grade5-apostles" id="grade5-apostles" />
                        <Label htmlFor="grade5-apostles" className="font-normal cursor-pointer">
                          خامسة ابتدائي (اسرة رسل)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="grade6-apostles" id="grade6-apostles" />
                        <Label htmlFor="grade6-apostles" className="font-normal cursor-pointer">
                          سادسة ابتدائي (اسرة رسل)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-lg font-semibold text-card-foreground">
                      3. اسم الطفل (في المرحله الابتدائية ) ثلاثي بالعربي *
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="text-lg"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-lg font-semibold text-card-foreground">
                      4. اسم الاب ثلاثي بالعربي*
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="text"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="text-lg"
                      placeholder="Enter father's name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-lg font-semibold text-card-foreground">
                      5. اسم الام ثلاثي بالعربي*
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="text-lg"
                      placeholder="Enter mother's name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-lg font-semibold text-card-foreground">
                      6. رقم تليفون الاب/الام *
                    </Label>
                    <Input
                      id="age"
                      name="age"
                      type="tel"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                      className="text-lg"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dietaryRestrictions" className="text-lg font-semibold text-card-foreground">
                      7. عدد الاخوات *
                    </Label>
                    <Input
                      id="dietaryRestrictions"
                      name="dietaryRestrictions"
                      type="number"
                      value={formData.dietaryRestrictions}
                      onChange={handleInputChange}
                      required
                      className="text-lg"
                      placeholder="Enter number of siblings"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="text-lg font-semibold text-card-foreground">
                      8. عدد التذاكر المطلوبة *
                    </Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      type="number"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      required
                      className="text-lg"
                      placeholder="Enter number of tickets"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-white">9. Payment Method *</Label>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleRadioChange("paymentMethod", value)}
                      required
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="font-normal cursor-pointer text-white">
                          Cash
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="instapay" id="instapay" />
                        <Label htmlFor="instapay" className="font-normal cursor-pointer text-white">
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
                        <p className="text-sm text-black font-semibold">
                          Please scan the QR code below to complete your Instapay payment:
                        </p>
                        <div className="relative h-64 w-full max-w-md mx-auto rounded-lg overflow-hidden border-2 border-primary/50">
                          <Image
                            src="/instapay-qr-code-payment.jpg"
                            alt="Instapay QR Code for payment"
                            fill
                            className="object-contain bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instapayDetails" className="text-base font-semibold text-black">
                            Enter your transaction reference number or screenshot confirmation *
                          </Label>
                          <Input
                            id="instapayDetails"
                            name="instapayDetails"
                            value={formData.instapayDetails}
                            onChange={handleInputChange}
                            required={formData.paymentMethod === "instapay"}
                            className="text-lg text-black"
                            placeholder="e.g., TXN123456789 or describe your confirmation"
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
            {eventImages.slice(4).map((src, index) => (
              <Card
                key={index + 4}
                className="overflow-hidden hover:scale-105 transition-transform duration-300 slide-in-up shadow-lg bg-black/60 backdrop-blur-sm border-2 border-primary/20"
                style={{ animationDelay: `${(index + 4) * 0.1}s` }}
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
      <footer className="bg-black text-white py-12 px-4 border-t-2 border-primary">
        <div className="max-w-7xl mx-auto text-center">
          <Image
            src="/images/design-mode/final%20Logo%20-01.png"
            alt="Holly Jolly Logo"
            width={150}
            height={150}
            className="mx-auto mb-6"
          />
          <h3 className="text-3xl font-bold mb-4 text-primary">Holly Jolly Christmas Event</h3>
          <p className="text-xl mb-2 text-red-200">Spreading joy and Christmas cheer!</p>
          <p className="text-lg opacity-90">© 2025 Holly Jolly. All rights reserved. 🎅🎄✨</p>
        </div>
      </footer>
    </div>
  )
}
