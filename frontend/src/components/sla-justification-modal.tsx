"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  Box,
  Flex,
  Text,
} from "@chakra-ui/react"
import { useAppStore } from "../store/useAppStore"

interface SLAJustificationModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (justification: string, reason: string) => void
  ticketProtocol: string
}

const delayReasons = [
  { value: "resources", label: "Falta de recursos/materiais" },
  { value: "weather", label: "Condições climáticas" },
  { value: "complexity", label: "Complexidade técnica maior que o esperado" },
  { value: "dependencies", label: "Dependência de outro órgão" },
  { value: "priority", label: "Priorização de chamados críticos" },
  { value: "other", label: "Outro motivo" },
]

export function SLAJustificationModal({ 
  open, 
  onClose, 
  onSubmit, 
  ticketProtocol 
}: SLAJustificationModalProps) {
  const [reason, setReason] = useState("")
  const [justification, setJustification] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Recupera a função da store caso exista, se não, utiliza a prop
  const submitSlaJustification = useAppStore((state) => state.submitSlaJustification)

  const handleSubmit = async () => {
    if (!reason || !justification.trim()) return
    
    setIsSubmitting(true)
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (submitSlaJustification) {
      await submitSlaJustification(ticketProtocol, justification, reason)
    } else {
      onSubmit(justification, reason)
    }

    setIsSubmitting(false)
    setReason("")
    setJustification("")
  }

  const isValid = reason && justification.trim().length >= 20

  return (
    <Modal 
      isOpen={open} 
      onClose={() => {}} 
      closeOnOverlayClick={false}
      closeOnEsc={false}
      isCentered
    >
      <ModalOverlay />
      <ModalContent 
        maxWidth={{ base: "90vw", sm: "500px" }}
        bg="white" 
        _dark={{ bg: "gray.800" }}
      >
        <ModalHeader pb="0">
          <Flex align="center" gap="3">
            <Flex h="10" w="10" align="center" justify="center" borderRadius="full" bg="red.50" _dark={{ bg: "red.900" }}>
              <AlertTriangle className="h-5 w-5 text-red-500" color="var(--chakra-colors-red-500)" />
            </Flex>
            <Box>
              <Text fontSize="lg" fontWeight="semibold" color="gray.900" _dark={{ color: "white" }}>
                Prazo de Resposta Encerrado
              </Text>
              <Text fontSize="sm" color="gray.500">
                Chamado {ticketProtocol}
              </Text>
            </Box>
          </Flex>
        </ModalHeader>

        <ModalBody className="space-y-4 py-4">
          <Box borderRadius="lg" bg="red.50" border="1px" borderColor="red.200" p="4" _dark={{ bg: "whiteAlpha.50", borderColor: "whiteAlpha.200" }}>
            <Text fontSize="sm" color="gray.900" _dark={{ color: "white" }}>
              O prazo de resposta para este chamado foi excedido. 
              É obrigatório informar o motivo do atraso antes de continuar.
            </Text>
            <Text fontSize="xs" color="gray.500" mt="2">
              Esta justificativa será visível para o cidadão.
            </Text>
          </Box>

          <FormControl isRequired>
            <FormLabel>Motivo do Atraso</FormLabel>
            <Select 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              placeholder="Selecione o motivo"
            >
              {delayReasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel display="flex" alignItems="center">
              Justificativa Detalhada
              <Text as="span" color="gray.500" fontSize="xs" ml="2">
                (mínimo 20 caracteres)
              </Text>
            </FormLabel>
            <Textarea
              placeholder="Descreva detalhadamente o motivo do atraso e as providências tomadas..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
              resize="none"
            />
            <Text fontSize="xs" color="gray.500" textAlign="right" mt="1">
              {justification.length}/20 caracteres mínimos
            </Text>
          </FormControl>
        </ModalBody>

          <Button 
            colorScheme="blue"
            onClick={handleSubmit} 
            isDisabled={!isValid}
            isLoading={isSubmitting}
            loadingText="Enviando..."
            className="w-full sm:w-auto"
          >
            Registrar Justificativa
          </Button>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
