"use client"

import { useState } from "react"
import { Eye, EyeOff, Fingerprint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface MobileLoginProps {
  onLogin: () => void
  onRegister: () => void
  onForgotPassword: () => void
}

export function MobileLogin({ onLogin, onRegister, onForgotPassword }: MobileLoginProps) {
  const [cpf, setCpf] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    if (formatted.length <= 14) setCpf(formatted)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header com Logo */}
      <header className="flex-shrink-0 px-6 pt-12 pb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-8 w-8 text-primary-foreground"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Smart City
          </h1>
          <p className="text-muted-foreground mt-1">
            Help Desk Pernambuco
          </p>
        </div>
      </header>

      {/* Formulário */}
      <main className="flex-1 px-6 pb-8">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="p-0 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-foreground">
                CPF
              </Label>
              <Input
                id="cpf"
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCPFChange}
                className="h-12 text-base font-mono"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">
                  Senha
                </Label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              className="w-full h-12 text-base font-medium"
              onClick={onLogin}
            >
              Entrar
            </Button>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ou
                </span>
              </div>
            </div>

            {/* Biometria */}
            <Button
              variant="outline"
              className="w-full h-12 text-base gap-2"
              onClick={onLogin}
            >
              <Fingerprint className="h-5 w-5" />
              Entrar com Biometria
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 px-6 pb-8 pt-4 border-t bg-muted/30">
        <div className="text-center">
          <p className="text-muted-foreground mb-3">
            Ainda não tem uma conta?
          </p>
          <Button
            variant="outline"
            className="w-full h-12 text-base font-medium"
            onClick={onRegister}
          >
            Criar conta
          </Button>
        </div>
      </footer>
    </div>
  )
}
