"use client"

import { useState } from "react"
import { GestorDashboard } from "@/components/gestor-dashboard"
import { MobileHome } from "@/components/mobile/mobile-home"
import { MobileLogin } from "@/components/mobile/mobile-login"
import { MobileRegister } from "@/components/mobile/mobile-register"
import { MobileNewTicket } from "@/components/mobile/mobile-new-ticket"
import { MobileTicketStep2 } from "@/components/mobile/mobile-ticket-step2"
import { Monitor, Smartphone, Shield } from "lucide-react"

import { Box, Flex, Text, Button } from "@chakra-ui/react";

type MobileScreen = "login" | "register" | "home" | "new-ticket" | "ticket-step2"

export default function Home() {
  const [view, setView] = useState<"gestor" | "cidadao" | "admin">("gestor")
  const [mobileScreen, setMobileScreen] = useState<MobileScreen>("login")
  const [selectedCategory, setSelectedCategory] = useState("Buraco na Via")

  const handleMobileLogin = () => setMobileScreen("home")
  const handleMobileRegister = () => setMobileScreen("home")
  const handleOpenNewTicket = () => setMobileScreen("new-ticket")
  const handleTicketStep2 = () => setMobileScreen("ticket-step2")
  const handleTicketSubmit = () => setMobileScreen("home")

  const renderMobileContent = () => {
    switch (mobileScreen) {
      case "login":
        return (
          <MobileLogin
            onLogin={handleMobileLogin}
            onRegister={() => setMobileScreen("register")}
            onForgotPassword={() => {}}
          />
        )
      case "register":
        return (
          <MobileRegister
            onBack={() => setMobileScreen("login")}
            onRegister={handleMobileRegister}
          />
        )
      case "home":
        return <MobileHome onNewTicket={handleOpenNewTicket} />
      case "new-ticket":
        return (
          <MobileNewTicket
            onBack={() => setMobileScreen("home")}
            onContinue={handleTicketStep2}
            onSelectCategory={setSelectedCategory}
          />
        )
      case "ticket-step2":
        return (
          <MobileTicketStep2
            onBack={() => setMobileScreen("new-ticket")}
            onSubmit={handleTicketSubmit}
            category={selectedCategory}
          />
        )
      default:
        return <MobileLogin onLogin={handleMobileLogin} onRegister={() => setMobileScreen("register")} onForgotPassword={() => {}} />
    }
  }

  return (
    <div className="min-h-screen">
      {/* Toggle de Visualização - Para demonstração */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 bg-card rounded-lg shadow-lg border p-1">
        <Button
          variant={view === "gestor" ? "default" : "ghost"}
          size="sm"
          onClick={() => setView("gestor")}
          className="gap-2"
        >
          <Monitor className="h-4 w-4" />
          <span className="hidden sm:inline">Gestor</span>
        </Button>
        <Button
          variant={view === "cidadao" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setView("cidadao")
            setMobileScreen("login")
          }}
          className="gap-2"
        >
          <Smartphone className="h-4 w-4" />
          <span className="hidden sm:inline">Cidadão</span>
        </Button>
        <Button
          variant={view === "admin" ? "default" : "ghost"}
          size="sm"
          onClick={() => setView("admin")}
          className="gap-2"
        >
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Admin</span>
        </Button>
      </div>

      {/* Conteúdo */}
      {view === "gestor" && <GestorDashboard />}
      {view === "admin" && <GestorDashboard showAdmin />}
      {view === "cidadao" && (
        <div className="max-w-md mx-auto min-h-screen shadow-2xl bg-background">
          {renderMobileContent()}
        </div>
      )}
    </div>
  )
}
