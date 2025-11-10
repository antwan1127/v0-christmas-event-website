"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Volume2, VolumeX } from "lucide-react"
import Image from "next/image"


export default function HollyJollyPage() {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")
  const [assignedInstapayUser, setAssignedInstapayUser] = useState("")
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  
  // Generate stable background ornaments that don't change on re-render - Reduced for better performance
  const backgroundOrnaments = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDuration: Math.random() * 1 + 4, // Slower animations
      animationDelay: Math.random() * 3, // More spread out delays
      width: Math.random() * 20 + 25, // Smaller elements
      height: Math.random() * 20 + 25,
    }))
  }, [])
  
  
  const [formData, setFormData] = useState({
    eventType: "",
    gender: "",
    grade: "",
    fullName: "",
    email: "",
    phone: "",
    age: "",
    dietaryRestrictions: "",
    emergencyContact: "",
    paymentMethod: "",
    instapayDetails: "",
    cashPickupTime: "", // Added field for cash pickup time selection
    servantName: "", // اسم الخادم /الخادمه ثلاثي بالعربي
    servantFamily: "", // الاسرة
    servantPhone: "", // رقم التليفون
  })
  const audioRef = useRef<HTMLAudioElement>(null)

  // Instapay users array
  const instapayUsers = [
    "Benyaminghobrial@instapay",
    "jssss@instapay", 
    "Karenamir@instapay",
    "Kerminamagedqnb@instapay"
  ]

  // Assign Instapay user on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * instapayUsers.length)
    setAssignedInstapayUser(instapayUsers[randomIndex])
  }, [])

  // Live countdown timer
  useEffect(() => {
    const targetDate = new Date('2025-12-26T00:00:00').getTime()
    
    const updateCountdown = () => {
      const now = new Date().getTime()
      const difference = targetDate - now
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        
        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }
    
    // Update immediately
    updateCountdown()
    
    // Update every second
    const interval = setInterval(updateCountdown, 1000)
    
    return () => clearInterval(interval)
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
    
        // For numeric fields (age, dietaryRestrictions, emergencyContact, servantPhone), only allow numbers
    if (name === 'age' || name === 'dietaryRestrictions' || name === 'emergencyContact' || name === 'servantPhone') {
      // Only allow numbers and empty string - block all letters and special characters
      if (value === '' || /^\d+$/.test(value)) {
        // For phone number (age, servantPhone), limit to 11 digits
        if ((name === 'age' || name === 'servantPhone') && value.length > 11) {
          return
        }
        // For brothers count (dietaryRestrictions), allow 0 or more
        if (name === 'dietaryRestrictions' && value !== '' && parseInt(value) < 0) {
          return
        }
        // For tickets count (emergencyContact), must be at least 1
        if (name === 'emergencyContact' && value !== '' && parseInt(value) < 1) {
          return
        }
        setFormData({ ...formData, [name]: value })
      }
    }
    // For Instapay reference number, only allow numbers and limit to 12 digits 
    else if (name === 'instapayDetails') {
      if (value === '' || /^\d+$/.test(value)) {
        if (value.length <= 12) {
          setFormData({ ...formData, [name]: value })
        }
      }
    }
    // For name fields (fullName, email, phone, servantName), only allow Arabic characters   
    else if (name === 'fullName' || name === 'email' || name === 'phone' || name === 'servantName') {     
      // Only allow Arabic letters, spaces, and common Arabic punctuation       
      if (value === '' || /^[\u0600-\u06FF\s\u064B-\u0652\u0670\u0640]*$/.test(value)) {                                                                        
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

  const validateArabicOnly = (text: string) => {
    // Check if text contains only Arabic letters, spaces, and common Arabic punctuation
    const arabicRegex = /^[\u0600-\u06FF\s\u064B-\u0652\u0670\u0640]+$/
    return arabicRegex.test(text)
  }

  const showValidationError = (message: string) => {
    setValidationMessage(message)
    setShowValidationModal(true)
  }

    const validateForm = () => {
    // Check required fields - always validate eventType
    if (!formData.eventType) {
      showValidationError("يرجى اختيار اسم الكنيسة")
      return false
    }
    if (!formData.paymentMethod) {
      showValidationError("يرجى اختيار طريقة الدفع")
      return false
    }

    // Validate based on form type
    if (formData.eventType === "خدام اجتماع الخدمه العام") {
      // Servant form validation
      if (!validateArabicOnly(formData.servantName)) {
        showValidationError("❌ خطأ في اسم الخادم /الخادمه\n\nاسم الخادم /الخادمه يجب أن يحتوي على أحرف عربية فقط (بدون أرقام أو أحرف إنجليزية)")                                     
        return false
      }
      if (!validateThreeWords(formData.servantName)) {
        showValidationError("❌ خطأ في اسم الخادم /الخادمه\n\nاسم الخادم /الخادمه يجب أن يكون ثلاثي (3 كلمات بالضبط)")                                                                
        return false
      }
      if (!formData.servantFamily || formData.servantFamily === '') {
        showValidationError("الاسرة مطلوبة")
        return false
      }
      if (!formData.servantPhone || formData.servantPhone === '') {
        showValidationError("رقم التليفون مطلوب")
        return false
      }
      if (formData.servantPhone && formData.servantPhone.length !== 11) {
        showValidationError("❌ خطأ في رقم التليفون\n\nرقم التليفون يجب أن يكون 11 رقم بالضبط")                                                                   
        return false
      }
    } else {
      // Regular form validation
      if (!formData.gender) {
        showValidationError("يرجى اختيار جنس الطفل")
        return false
      }
      if (!formData.grade) {
        showValidationError("يرجى اختيار الصف")
        return false
      }

      // Check if questions 3, 4, 5 have exactly 3 words and are Arabic only      
      if (!validateArabicOnly(formData.fullName)) {
        showValidationError("❌ خطأ في اسم الطفل\n\nاسم الطفل يجب أن يحتوي على أحرف عربية فقط (بدون أرقام أو أحرف إنجليزية)")                                     
        return false
      }
      if (!validateThreeWords(formData.fullName)) {
        showValidationError("❌ خطأ في اسم الطفل\n\nاسم الطفل يجب أن يكون ثلاثي (3 كلمات بالضبط)")                                                                
        return false
      }

      if (!validateArabicOnly(formData.email)) {
        showValidationError("❌ خطأ في اسم الأب\n\nاسم الأب يجب أن يحتوي على أحرف عربية فقط (بدون أرقام أو أحرف إنجليزية)")                                       
        return false
      }
      if (!validateThreeWords(formData.email)) {
        showValidationError("❌ خطأ في اسم الأب\n\nاسم الأب يجب أن يكون ثلاثي (3 كلمات بالضبط)")                                                                  
        return false
      }

      if (!validateArabicOnly(formData.phone)) {
        showValidationError("❌ خطأ في اسم الأم\n\nاسم الأم يجب أن يحتوي على أحرف عربية فقط (بدون أرقام أو أحرف إنجليزية)")                                       
        return false
      }
      if (!validateThreeWords(formData.phone)) {
        showValidationError("❌ خطأ في اسم الأم\n\nاسم الأم يجب أن يكون ثلاثي (3 كلمات بالضبط)")                                                                  
        return false
      }

      // Check if numeric fields are not empty
      if (!formData.age || formData.age === '') {
        showValidationError("رقم تليفون الاب/الام مطلوب")
        return false
      }
      if (formData.age && formData.age.length !== 11) {
        showValidationError("❌ خطأ في رقم التليفون\n\nرقم التليفون يجب أن يكون 11 رقم بالضبط")                                                                   
        return false
      }
      if (!formData.dietaryRestrictions || formData.dietaryRestrictions === '') { 
        showValidationError("عدد الاخوات مطلوب")
        return false
      }
    }

    // Common validation for both forms
    if (!formData.emergencyContact || formData.emergencyContact === '') {       
      showValidationError("عدد التذاكر المطلوبة مطلوب")
      return false
    }
    if (formData.emergencyContact && parseInt(formData.emergencyContact) <= 0) {
      showValidationError("❌ خطأ في عدد التذاكر\n\nعدد التذاكر يجب أن يكون أكبر من صفر")                                                                       
      return false
    }
    
    // Check payment method specific fields
    if (formData.paymentMethod === "instapay" && !formData.instapayDetails) {
      showValidationError("يرجى إدخال رقم المعاملة")
      return false
    }
    if (formData.paymentMethod === "instapay" && formData.instapayDetails && formData.instapayDetails.length !== 12) {
      showValidationError("❌ خطأ في رقم المعاملة\n\nرقم المعاملة يجب أن يكون 12 رقم بالضبط")
      return false
    }
    if (formData.paymentMethod === "cash" && !formData.cashPickupTime) {
      showValidationError("يرجى اختيار وقت استلام النقود")
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
        "https://script.google.com/macros/s/AKfycbxCiBwDLvy3qix-5D4D_n3DteE_n2QkuPTSRIUfU3ljavWsh9qLNzjGnZaImQY4sPiw/exec"

      // Prepare the payment info
      let paymentInfo = ""
      if (formData.paymentMethod === "instapay") {
        paymentInfo = `Instapay - ${assignedInstapayUser}`
      } else {
        paymentInfo = `Cash - ${formData.cashPickupTime}`
      }

      // Prepare submission data based on form type
      let submissionData
      if (formData.eventType === "خدام اجتماع الخدمه العام") {
        // Servant form submission
        submissionData = {
          question1: formData.eventType,
          question2: formData.servantName,
          question3: formData.servantFamily,
          question4: formData.servantPhone,
          question5: "N/A",
          question6: "N/A",
          question7: "N/A",
          question8: "N/A",
          question9: formData.emergencyContact,
          question10: paymentInfo,
          question11: parseInt(formData.emergencyContact) * 200,
          question12: formData.paymentMethod === "instapay" ? formData.instapayDetails : "",
        }
      } else {
        // Regular form submission
        submissionData = {
          question1: formData.eventType,
          question2: formData.fullName,
          question3: formData.grade,
          question4: formData.gender,
          question5: formData.email,
          question6: formData.phone,
          question7: formData.age,
          question8: formData.dietaryRestrictions || "None",
          question9: formData.emergencyContact,
          question10: paymentInfo,
          question11: parseInt(formData.emergencyContact) * 200,
          question12: formData.paymentMethod === "instapay" ? formData.instapayDetails : "",
        }
      }

      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      // Since we're using no-cors mode, we can't check response status
      // But we'll assume success if no error is thrown
      setShowSuccessModal(true)
      setFormData({
        eventType: "",
        gender: "",
        grade: "",
        fullName: "",
        email: "",
        phone: "",
        age: "",
        dietaryRestrictions: "",
        emergencyContact: "",
        paymentMethod: "",
        instapayDetails: "",
        cashPickupTime: "",
        servantName: "",
        servantFamily: "",
        servantPhone: "",
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
      {/* Elegant Wooden Frame - Removed yellow borders */}
      <div className="fixed inset-0 pointer-events-none z-30">
        
        {/* Decorative images removed for better performance */}
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
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 bg-primary text-primary-foreground p-3 sm:p-4 rounded-full shadow-lg hover:scale-110 transition-transform min-h-[48px] min-w-[48px] sm:min-h-[56px] sm:min-w-[56px]"
        aria-label="Toggle music"
      >
        {isMusicPlaying ? <Volume2 size={20} className="sm:w-6 sm:h-6" /> : <VolumeX size={20} className="sm:w-6 sm:h-6" />}
      </button>



      <div className="fixed inset-0 pointer-events-none z-10">
        {backgroundOrnaments.map((ornament, i) => (
          <div
            key={`ornament-${i}`}
            className="absolute"
            style={{
              left: `${ornament.left}%`,
              top: `${ornament.top}%`,
              width: `${ornament.width}px`,
              height: `${ornament.height}px`,
            }}
          >
            <Image
              src={i % 4 === 0 ? "/images/design-mode/tree.png" : i % 4 === 1 ? "/images/design-mode/cone.png" : i % 4 === 2 ? "/images/design-mode/star.png" : "/images/design-mode/hood.png"}
              alt="Christmas decoration"
              width={60}
              height={60}
              className="w-full h-full object-contain opacity-60"
            />
          </div>
        ))}
      </div>

      <div className="fixed left-4 top-1/4 z-10 pointer-events-none">
        <Image
          src="/images/design-mode/boy.png"
          alt="Christmas boy"
          width={80}
          height={80}
          className="w-20 h-20 object-contain opacity-70"
        />
      </div>
      <div className="fixed right-4 top-1/3 z-10 pointer-events-none">
        <Image
          src="/images/design-mode/hood.png"
          alt="Christmas hood"
          width={80}
          height={80}
          className="w-20 h-20 object-contain opacity-70"
        />
      </div>

      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(8)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 15 + 10}px`,
              height: `${Math.random() * 15 + 10}px`,
            }}
          >
            <Image
              src="/images/design-mode/star.png"
              alt="Twinkling star"
              width={35}
              height={35}
              className="w-full h-full object-contain opacity-40"
            />
          </div>
        ))}
      </div>

      <div className="fixed top-0 left-0 right-0 z-20 h-12 flex justify-around items-center pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: i % 3 === 0 ? "#dc2626" : i % 3 === 1 ? "#ffd700" : "#ffffff",
            }}
          />
        ))}
      </div>

      {/* Hero Section with Tree Image */}
      <section className="relative h-screen flex items-center justify-center pt-4 pb-4 px-4">
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <Image
            src="/images/design-mode/tree.png"
            alt="Christmas Tree"
            width={800}
            height={1200}
            className="object-contain w-72 sm:w-80 md:w-96 lg:w-[600px] xl:w-[700px] h-auto"
          />
        </div>

        <div className="relative z-30 text-center px-4">
          <div className="mb-4 sm:mb-6 md:mb-8 float-animation">
            <Image
              src="/images/design-mode/final-logo-01.png"
              alt="Holly Jolly Logo"
              width={400}
              height={400}
              className="mx-auto drop-shadow-2xl w-48 sm:w-64 md:w-80 lg:w-96 xl:w-[400px] h-auto"
              priority
            />
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-red-600 mb-6 sm:mb-8 md:mb-12 drop-shadow-lg leading-tight font-english">
            Welcome to
            <br />
            Holly Jolly!
          </h1>
          
          {/* Live Countdown Timer */}
          <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-2xl p-6 mb-8 border-2 border-primary/20 shadow-lg">
            <h3 className="text-2xl font-bold text-primary mb-4 font-english">🎄 Event Countdown 🎄</h3>
            <div className="flex justify-center space-x-4 text-center">
              <div className="bg-white rounded-lg p-3 shadow-md min-w-[80px]">
                <div className="text-3xl font-bold text-red-600 font-english">{timeLeft.days}</div>
                <div className="text-sm text-gray-600 font-english">Days</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-md min-w-[80px]">
                <div className="text-3xl font-bold text-green-600 font-english">{timeLeft.hours}</div>
                <div className="text-sm text-gray-600 font-english">Hours</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-md min-w-[80px]">
                <div className="text-3xl font-bold text-blue-600 font-english">{timeLeft.minutes}</div>
                <div className="text-sm text-gray-600 font-english">Minutes</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-md min-w-[80px]">
                <div className="text-3xl font-bold text-purple-600 font-english">{timeLeft.seconds}</div>
                <div className="text-sm text-gray-600 font-english">Seconds</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 font-english">Until the magical celebration begins!</p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-2xl p-8 sm:p-12 border-2 border-primary/20 shadow-lg relative z-30">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight font-english">
              A Magical Christmas Celebration
          </h2>
            <p className="text-lg sm:text-xl text-gray-700 font-medium font-english">
              Join us for an unforgettable holiday experience!
            </p>
          </div>
        </div>
      </section>

      <section id="gallery" className="py-20 px-4 relative z-20">
        {/* Logo watermark background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
          <Image
            src="/images/design-mode/final-logo-01.png"
            alt="Holly Jolly Logo Background"
            width={600}
            height={600}
            className="object-contain"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-30">
          <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-2xl p-8 sm:p-12 border-2 border-primary/20 shadow-lg mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-center text-primary mb-4 sm:mb-6 font-english">
              Memories from Last Year
            </h2>
            <p className="text-center text-lg sm:text-xl text-gray-700 font-medium font-english">
            Relive the joy and magic of our previous celebration!
          </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
            {eventImages.slice(0, 6).map((src, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:scale-105 transition-transform duration-300 slide-in-up shadow-lg bg-white/90 backdrop-blur-sm border-2 border-primary/20"
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
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4 font-english">Register Now!</h2>
                  <p className="text-lg sm:text-xl text-gray-700 font-english">
                    Secure your spot at this year's Holly Jolly celebration
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Event Information */}
                  <div className="bg-gradient-to-r from-red-50 to-green-50 border-2 border-primary/20 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="text-center mb-3 sm:mb-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2 font-english">🎄 Holly Jolly 🎄</h3>
                      <p className="text-base sm:text-lg text-gray-700 font-semibold font-arabic">يوم رياضي لأطفال ابتدائي وأسرهم</p>
                      </div>
                    
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-start space-x-2">
                        <span className="text-primary font-bold">📍</span>
                        <span className="font-arabic">تابع لكنيسة مارمرقس مصر الجديدة وتحت إشراف أسرة القديس أبسخيرون القليني</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="text-primary font-bold">🏫</span>
                        <span className="font-arabic">سيقام في الـ College de la Salle بالتجمع</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="text-primary font-bold">📅</span>
                        <span className="font-arabic">الجمعة ٢٦ من ديسمبر ٢٠٢٥</span>
                      </div>
                      </div>
                    
                    <div className="mt-4 p-4 bg-white/80 rounded-lg border border-primary/30">
                      <h4 className="text-lg font-bold text-primary mb-3 text-center font-arabic">الشروط والأحكام</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span className="font-arabic">آخر ميعاد للحجز واسترداد الفلوس ٢١ ديسمبر</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-500 font-bold">•</span>
                          <span className="font-arabic">سعر التذكرة الواحدة لكل فرد في العائلة ٢٠٠ جنيه ليوم ١٤ ديسمبر</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-500 font-bold">•</span>
                          <span className="font-arabic">ابتداء من ١٥ ل ٢١ ديسمبر سعر التذكرة الواحدة لكل فرد ٢٥٠ جنيه</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span className="font-arabic">الدخول بالتذاكر لنفس الأشخاص المسجلين في الفورم (ممنوع استبدال التذاكر)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-green-500 font-bold">•</span>
                          <span className="font-arabic">نرحب بعائلة الطفل (أب وأم وأخوات فقط)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-green-500 font-bold">•</span>
                          <span className="font-arabic">يشترط وجود احد الابوين</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-500 font-bold">•</span>
                          <span className="font-arabic">الاخوات بداية من ٣ سنين لهم تذكرة كاملة</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span className="font-arabic">نعتذر لا يوجد تذاكر يوم الحفلة على الباب</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span className="font-arabic">لا يوجد باص</span>
                        </li>
                      </ul>
                      </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base sm:text-lg font-semibold text-gray-800 font-arabic">1. اسم الكنيسة *</Label>
                    <RadioGroup
                      value={formData.eventType}
                      onValueChange={(value) => handleRadioChange("eventType", value)}
                      required
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="مارمرقس م.الجديده مدارس احد" id="church1" />
                        <Label htmlFor="church1" className="font-normal cursor-pointer text-gray-800 font-arabic">
                          مارمرقس م.الجديده مدارس احد
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="مارمرقس م.الجديده اجتماع" id="church2" />
                        <Label htmlFor="church2" className="font-normal cursor-pointer text-gray-800 font-arabic">
                          مارمرقس م.الجديده اجتماع
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="العذارء ارض الجولف" id="church3" />
                        <Label htmlFor="church3" className="font-normal cursor-pointer text-gray-800 font-arabic">
                          العذارء ارض الجولف
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="الكاروز التجمع" id="church4" />
                        <Label htmlFor="church4" className="font-normal cursor-pointer text-gray-800 font-arabic">
                          الكاروز التجمع
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="العذارء و الانبا بيشوي التجمع" id="church5" />
                        <Label htmlFor="church5" className="font-normal cursor-pointer text-gray-800 font-arabic">
                          العذارء و الانبا بيشوي التجمع
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="العذارء الرحاب" id="church6" />
                        <Label htmlFor="church6" className="font-normal cursor-pointer text-gray-800 font-arabic">
                          العذارء الرحاب
                        </Label>
                      </div>
                                            <div className="flex items-center space-x-2">
                        <RadioGroupItem value="العذارء و مارجرجس مدينتي" id="church7" />                                                                        
                        <Label htmlFor="church7" className="font-normal cursor-pointer text-gray-800 font-arabic">                                              
                          العذارء و مارجرجس مدينتي
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="خدام اجتماع الخدمه العام" id="church8" />                                                                        
                        <Label htmlFor="church8" className="font-normal cursor-pointer text-gray-800 font-arabic">                                              
                          خدام اجتماع الخدمه العام
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Conditional rendering based on eventType */}
                  {formData.eventType === "خدام اجتماع الخدمه العام" ? (
                    // Servant form fields
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="servantName" className="text-base sm:text-lg font-semibold text-gray-800 font-arabic">                                         
                          2. اسم الخادم /الخادمه ثلاثي بالعربي *
                        </Label>
                        <Input
                          id="servantName"
                          name="servantName"
                          value={formData.servantName}
                          onChange={handleInputChange}
                          required
                          className="text-lg text-gray-800"
                          placeholder=""
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="servantFamily" className="text-base sm:text-lg font-semibold text-gray-800 font-arabic">                                         
                          3. الاسرة *
                        </Label>
                        <Input
                          id="servantFamily"
                          name="servantFamily"
                          type="text"
                          value={formData.servantFamily}
                          onChange={handleInputChange}
                          required
                          className="text-lg text-gray-800"
                          placeholder=""
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="servantPhone" className="text-base sm:text-lg font-semibold text-gray-800 font-arabic">                                         
                          4. رقم التليفون *
                        </Label>
                        <Input
                          id="servantPhone"
                          name="servantPhone"
                          type="tel"
                          inputMode="numeric"
                          value={formData.servantPhone}
                          onChange={handleInputChange}
                          required
                          className="text-lg text-gray-800"
                          placeholder=""
                          maxLength={11}
                        />
                      </div>
                    </>
                  ) : (
                    // Regular form fields
                    <>
                                    <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-base sm:text-lg font-semibold text-gray-800 font-arabic">                                         
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

                  <div className="space-y-3">
                    <Label className="text-base sm:text-lg font-semibold text-gray-800">                                          
                      3. Grade/ <span className="font-arabic">سنة الطفل</span> *
                    </Label>
                    <RadioGroup
                      value={formData.grade}
                      onValueChange={(value) => handleRadioChange("grade", value)}                                                                          
                      required
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="اولي ابتدائي" id="grade1" />
                        <Label htmlFor="grade1" className="font-normal cursor-pointer text-gray-800 font-arabic">                                              
                          اولي ابتدائي <span className="font-english">(grade 1)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="تانية ابتدائي" id="grade2" />
                        <Label htmlFor="grade2" className="font-normal cursor-pointer text-gray-800 font-arabic">                                              
                          تانية ابتدائي <span className="font-english">(grade 2)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ثالثة ابتدائي" id="grade3" />
                        <Label htmlFor="grade3" className="font-normal cursor-pointer text-gray-800 font-arabic">                                              
                          ثالثة ابتدائي <span className="font-english">(grade 3)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="رابعه ابتدائي" id="grade4" />
                        <Label htmlFor="grade4" className="font-normal cursor-pointer text-gray-800 font-arabic">                                              
                          رابعه ابتدائي <span className="font-english">(grade 4)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="خامسة ابتدائي" id="grade5" />
                        <Label htmlFor="grade5" className="font-normal cursor-pointer text-gray-800 font-arabic">                                              
                          خامسة ابتدائي <span className="font-english">(grade 5)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="سادسة ابتدائي" id="grade6" />
                        <Label htmlFor="grade6" className="font-normal cursor-pointer text-gray-800 font-arabic">                                              
                          سادسة ابتدائي <span className="font-english">(grade 6)</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-base sm:text-lg font-semibold text-gray-800 font-english">                                          
                      4. Gender *
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
                    <Label htmlFor="email" className="text-base sm:text-lg font-semibold text-gray-800 font-arabic">                                            
                      5. اسم الاب ثلاثي بالعربي*
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
                    <Label htmlFor="phone" className="text-base sm:text-lg font-semibold text-gray-800 font-arabic">                                            
                      6. اسم الام ثلاثي بالعربي*
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
                    <Label htmlFor="age" className="text-base sm:text-lg font-semibold text-gray-800 font-arabic">                                              
                      7. رقم تليفون الاب/الام *
                    </Label>
                    <Input
                      id="age"
                      name="age"
                      type="tel"
                      inputMode="numeric"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                      className="text-lg text-gray-800"
                      placeholder=""
                      maxLength={11}
                    />
                  </div>

                                    <div className="space-y-2">
                    <Label htmlFor="dietaryRestrictions" className="text-base sm:text-lg font-semibold text-gray-800 font-arabic">                              
                      8. عدد الاخوات *
                    </Label>
                    <Input
                      id="dietaryRestrictions"
                      name="dietaryRestrictions"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      value={formData.dietaryRestrictions}
                      onChange={handleInputChange}
                      required
                      className="text-lg text-gray-800"
                      placeholder=""
                    />
                  </div>
                    </>
                  )}

                  {/* Common fields for both forms - Number of tickets */}
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="text-base sm:text-lg font-semibold text-gray-800 font-arabic">                                 
                      9. عدد التذاكر المطلوبة *
                    </Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      step="1"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      required
                      className="text-lg text-gray-800"
                      placeholder=""
                    />
                    {formData.emergencyContact && parseInt(formData.emergencyContact) > 0 && (
                      <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Total Cost:</p>
                          <p className="text-2xl font-bold text-green-600">
                            {parseInt(formData.emergencyContact) * 200} جنيه
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.emergencyContact} ticket(s) × 200 جنيه each
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                                    <div className="space-y-3">
                    <Label className="text-base sm:text-lg font-semibold text-gray-800 font-english">10. Payment Method *</Label>                                
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleRadioChange("paymentMethod", value)}                                                                      
                      required
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="font-normal cursor-pointer text-gray-800 font-english">
                          Cash
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="instapay" id="instapay" />
                        <Label htmlFor="instapay" className="font-normal cursor-pointer text-gray-800 font-english">
                          Instapay
                        </Label>
                      </div>
                    </RadioGroup>

                    {formData.paymentMethod === "cash" && (
                      <div className="mt-4 space-y-4 p-4 bg-white/90 rounded-lg border-2 border-primary/30">
                        <p className="text-base text-black font-bold text-center font-arabic">
                          هنجمع الاشتراكات ابتداء من ٢ نوفمبر
                        </p>
                        <p className="text-sm text-black font-semibold font-english">Please select your preferred pickup time:</p>
                        <RadioGroup
                          value={formData.cashPickupTime}
                          onValueChange={(value) => handleRadioChange("cashPickupTime", value)}
                          required
                        >
                          <div className="flex items-center space-x-2 p-3 bg-white rounded border border-primary/20">
                            <RadioGroupItem value="friday" id="friday" />
                            <Label
                              htmlFor="friday"
                              className="font-normal cursor-pointer text-black text-sm leading-relaxed font-arabic"
                            >
                              الجمعه من ١٠ص ل ١ظ في المبني الجديد +بين الفيلتين في الكنيسة الرئيسية
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 bg-white rounded border border-primary/20">
                            <RadioGroupItem value="sunday" id="sunday" />
                            <Label
                              htmlFor="sunday"
                              className="font-normal cursor-pointer text-black text-sm leading-relaxed font-arabic"
                            >
                              الاحد من ٦ م ل ٨ م في المبني الجديد +بين الفليتين في الكنيسة الرئيسية
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {formData.paymentMethod === "instapay" && (
                      <div className="mt-4 space-y-4 p-4 bg-white/90 rounded-lg border-2 border-primary/30">
                        <div className="text-center mb-4">
                          <p className="text-lg font-semibold text-primary mb-2 font-english">Payment Instructions</p>
                          <p className="text-sm text-gray-700 font-english">
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
                          <Label htmlFor="instapayDetails" className="text-base font-semibold text-black font-english">
                            Enter your transaction reference number *
                          </Label>
                          <Input
                            id="instapayDetails"
                            name="instapayDetails"
                            type="number"
                            inputMode="numeric"
                            value={formData.instapayDetails}
                            onChange={handleInputChange}
                            required={formData.paymentMethod === "instapay"}
                            className="text-base sm:text-lg text-gray-800"
                            placeholder=""
                            maxLength={12}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg sm:text-xl py-4 sm:py-6 rounded-full shadow-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] sm:min-h-[56px]"
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
          <h3 className="text-3xl font-bold mb-4 text-primary font-english">Holly Jolly Christmas Event</h3>
          <p className="text-xl mb-2 text-gray-600 font-english">Spreading joy and Christmas cheer!</p>
          <p className="text-lg opacity-90 font-english">© 2025 Holly Jolly. All rights reserved. 🎅🎄✨</p>
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
              <h2 className="text-3xl font-bold text-primary mb-2 font-arabic">🎉 تم التسجيل بنجاح! 🎉</h2>
              <p className="text-lg text-gray-700 mb-4 font-english">Thank you for registering for Holly Jolly!</p>
              <p className="text-sm text-gray-600 mb-4 font-english">Your registration has been saved successfully.</p>
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200">
                <p className="text-sm text-gray-700 font-semibold mb-2 font-english">📸 Follow us on Instagram:</p>
                <a 
                  href="https://www.instagram.com/abssportsteam?igsh=MjRvbWd2bW82ZGs2" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg font-bold text-pink-600 font-english hover:text-pink-700 hover:underline cursor-pointer select-text"
                >
                  @Abssportsteam
                </a>
              </div>
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

      {/* Validation Error Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl animate-bounceIn">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-left">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-medium">
                  {validationMessage}
                </pre>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowValidationModal(false)}
                className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-colors"
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
