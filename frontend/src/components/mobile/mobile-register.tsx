"use client"

import { useState } from "react"
import { ArrowLeft, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react"
import {
  Box,
  Flex,
  Button,
  Input,
  FormControl,
  FormLabel,
  Text,
  IconButton,
  InputGroup,
  InputRightElement
} from "@chakra-ui/react"
import useAppStore from "../../store/useAppStore"

interface MobileRegisterProps {
  onBack: () => void
  onRegister: () => void
}

export function MobileRegister({ onBack, onRegister }: MobileRegisterProps) {
  // Integração opcional com store se você precisar salvar o usuário após o registro
  // const registerUser = useAppStore((state) => state.registerUser)

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

  const handleRegister = () => {
    // if (registerUser) registerUser(formData)
    onRegister()
  }

  return (
    <Flex direction="column" minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      {/* Header */}
      <Box as="header" position="sticky" top="0" zIndex="50" bg="white" _dark={{ bg: "gray.800" }} borderBottomWidth="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }} px="4" py="4">
        <Flex align="center" gap="4">
          <IconButton aria-label="Voltar" variant="ghost" icon={<ArrowLeft className="h-5 w-5" />} onClick={onBack} />
          <Box>
            <Text as="h1" fontSize="lg" fontWeight="semibold" color="gray.900" _dark={{ color: "white" }}>Criar Conta</Text>
            <Text fontSize="sm" color="gray.500">Preencha seus dados</Text>
          </Box>
        </Flex>
      </Box>

      {/* Formulário */}
      <Box as="main" flex="1" p="6" pb="32" className="space-y-5">
        <FormControl isRequired>
          <FormLabel>Nome Completo</FormLabel>
          <Input
            placeholder="Seu nome completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            size="lg"
            bg="white"
            _dark={{ bg: "gray.800" }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>CPF</FormLabel>
          <Input
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={(e) => {
              const formatted = formatCPF(e.target.value)
              if (formatted.length <= 14) setFormData({ ...formData, cpf: formatted })
            }}
            size="lg"
            fontFamily="mono"
            bg="white"
            _dark={{ bg: "gray.800" }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>E-mail</FormLabel>
          <Input
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            size="lg"
            bg="white"
            _dark={{ bg: "gray.800" }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Telefone</FormLabel>
          <Input
            inputMode="tel"
            placeholder="(00) 00000-0000"
            value={formData.phone}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value)
              if (formatted.length <= 15) setFormData({ ...formData, phone: formatted })
            }}
            size="lg"
            fontFamily="mono"
            bg="white"
            _dark={{ bg: "gray.800" }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Senha</FormLabel>
          <InputGroup size="lg">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Crie uma senha forte"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              bg="white"
              _dark={{ bg: "gray.800" }}
            />
            <InputRightElement>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                icon={showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                onClick={() => setShowPassword(!showPassword)}
                color="gray.500"
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Confirmar Senha</FormLabel>
          <InputGroup size="lg">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Digite a senha novamente"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              bg="white"
              _dark={{ bg: "gray.800" }}
            />
            <InputRightElement>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                icon={showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                color="gray.500"
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        {/* Requisitos da senha */}
        {formData.password && (
          <Box borderRadius="lg" bg="gray.100" _dark={{ bg: "gray.800" }} p="4" className="space-y-2">
            <Text fontSize="sm" fontWeight="medium" color="gray.900" _dark={{ color: "gray.100" }}>Requisitos da senha:</Text>
            {passwordRequirements.map((req, index) => (
              <Flex key={index} align="center" gap="2">
                {req.met ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" color="var(--chakra-colors-green-500)" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" color="var(--chakra-colors-gray-400)" />
                )}
                <Text fontSize="sm" color={req.met ? "green.500" : "gray.500"}>
                  {req.label}
                </Text>
              </Flex>
            ))}
          </Box>
        )}

        {/* Termos */}
        <Text fontSize="xs" color="gray.500" textAlign="center" lineHeight="relaxed">
          Ao criar sua conta, você concorda com os{" "}
          <Text as="a" href="#" color="blue.500" _hover={{ textDecoration: "underline" }}>Termos de Uso</Text>
          {" "}e{" "}
          <Text as="a" href="#" color="blue.500" _hover={{ textDecoration: "underline" }}>Política de Privacidade</Text>.
        </Text>
      </Box>

      {/* Footer */}
      <Box as="footer" position="fixed" bottom="0" left="0" right="0" bg="white" _dark={{ bg: "gray.800" }} borderTopWidth="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }} p="4">
        <Button
          w="full"
          size="lg"
          colorScheme="blue"
          fontWeight="medium"
          onClick={handleRegister}
          isDisabled={!passwordRequirements.every(r => r.met)}
        >
          Criar Conta
        </Button>
      </Box>
    </Flex>
  )
}
