"use client"

import { useState } from "react"
import { Eye, EyeOff, Fingerprint } from "lucide-react"
import {
  Box,
  Flex,
  Button,
  Input,
  FormControl,
  FormLabel,
  Text,
  IconButton,
  Divider,
  InputGroup,
  InputRightElement
} from "@chakra-ui/react"

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
    <Flex direction="column" minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      {/* Header com Logo */}
      <Box as="header" flexShrink={0} px="6" pt="12" pb="8">
        <div className="text-center">
          <Flex
            align="center"
            justify="center"
            h="16"
            w="16"
            borderRadius="2xl"
            bg="blue.500"
            mb="4"
            mx="auto"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-8 w-8 text-white"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </Flex>
          <Text as="h1" fontSize="2xl" fontWeight="bold" letterSpacing="tight" color="gray.900" _dark={{ color: "white" }}>
            Smart City
          </Text>
          <Text color="gray.500" mt="1">
            Help Desk Pernambuco
          </Text>
        </div>
      </Box>

      {/* Formulário */}
      <Box as="main" flex="1" px="6" pb="8">
        <Box className="space-y-6">
          <FormControl>
            <FormLabel color="gray.900" _dark={{ color: "gray.100" }}>
              CPF
            </FormLabel>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleCPFChange}
              size="lg"
              fontFamily="mono"
              bg="white"
              _dark={{ bg: "gray.800" }}
            />
          </FormControl>

          <FormControl>
            <Flex align="center" justify="space-between" mb="2">
              <FormLabel mb="0" color="gray.900" _dark={{ color: "gray.100" }}>
                Senha
              </FormLabel>
              <Button
                variant="link"
                size="sm"
                colorScheme="blue"
                onClick={onForgotPassword}
                fontWeight="normal"
              >
                Esqueci minha senha
              </Button>
            </Flex>
            <InputGroup size="lg">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <Button colorScheme="blue" size="lg" w="full" fontWeight="medium" onClick={onLogin}>
            Entrar
          </Button>

          {/* Separador */}
          <Flex align="center" justify="center" position="relative" py="2">
            <Divider />
            <Text
              position="absolute"
              bg="gray.50"
              _dark={{ bg: "gray.900" }}
              px="2"
              fontSize="xs"
              textTransform="uppercase"
              color="gray.500"
            >
              ou
            </Text>
          </Flex>

          {/* Biometria */}
          <Button variant="outline" size="lg" w="full" gap="2" onClick={onLogin}>
            <Fingerprint className="h-5 w-5" />
            Entrar com Biometria
          </Button>
        </Box>
      </Box>

      {/* Footer */}
      <Box as="footer" flexShrink={0} px="6" pb="8" pt="4" borderTopWidth="1px" borderColor="gray.200" _dark={{ borderColor: "gray.800" }}>
        <div className="text-center">
          <Text color="gray.500" mb="3">
            Ainda não tem uma conta?
          </Text>
          <Button variant="outline" size="lg" w="full" fontWeight="medium" onClick={onRegister}>
            Criar conta
          </Button>
        </div>
      </Box>
    </Flex>
  )
}
