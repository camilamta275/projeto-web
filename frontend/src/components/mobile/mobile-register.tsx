"use client"

import { useState } from "react"
import { ArrowLeft, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface MobileRegisterProps {
  onBack: () => void
  onRegister: () => void
}

export function MobileRegister({ onBack, onRegister }: MobileRegisterProps) {
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return `(${numbers}`
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", met: formData.password.length >= 8 },
    { label: "Uma letra maiúscula", met: /[A-Z]/.test(formData.password) },
    { label: "Um número", met: /\d/.test(formData.password) },
    { label: "Senhas coincidem", met: formData.password === formData.confirmPassword && formData.confirmPassword !== "" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b px-4 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Criar Conta</h1>
            <p className="text-sm text-muted-foreground">Preencha seus dados</p>
          </div>
        </div>
      </header>

      {/* Formulário */}
      <main className="flex-1 p-6 space-y-5 pb-32">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            placeholder="Seu nome completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={(e) => {
              const formatted = formatCPF(e.target.value)
              if (formatted.length <= 14) setFormData({ ...formData, cpf: formatted })
            }}
            className="h-12 font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            inputMode="tel"
            placeholder="(00) 00000-0000"
            value={formData.phone}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value)
              if (formatted.length <= 15) setFormData({ ...formData, phone: formatted })
            }}
            className="h-12 font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Crie uma senha forte"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-12 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Digite a senha novamente"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="h-12 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Requisitos da senha */}
        {formData.password && (
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Requisitos da senha:</p>
            {passwordRequirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2">
                {req.met ? (
                  <CheckCircle2 className="h-4 w-4 text-status-completed" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={cn(
                  "text-sm",
                  req.met ? "text-status-completed" : "text-muted-foreground"
                )}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Termos */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Ao criar sua conta, você concorda com os{" "}
          <a href="#" className="text-primary hover:underline">Termos de Uso</a>
          {" "}e{" "}
          <a href="#" className="text-primary hover:underline">Política de Privacidade</a>.
        </p>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t p-4">
        <Button
          className="w-full h-12 text-base font-medium"
          onClick={onRegister}
          disabled={!passwordRequirements.every(r => r.met)}
        >
          Criar Conta
        </Button>
      </footer>
    </div>
  )
}
