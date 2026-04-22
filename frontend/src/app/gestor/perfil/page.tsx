"use client";

import { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Input,
  Checkbox,
  Heading,
  Text,
  Icon,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import useManagerProfileStore from '@/stores/managerProfileStore';

export default function ManagerProfilePage() {
  const { profile, updateNotificationPref, changePassword, updateAvatar } =
    useManagerProfileStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      showToast('Senha alterada com sucesso', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showToast(error, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await updateAvatar(file);
        showToast('Avatar atualizado com sucesso!', 'success');
      } catch (error: any) {
        showToast(error, 'error');
      }
    }
  };

  return (
    <Box className="page">
      {/* Header */}
      <Box className="header" as="header">
        <Heading as="h1" size="md" m={0} fontSize="16px" fontWeight={600}>
          Meu Perfil
        </Heading>
      </Box>

      {/* Main Container */}
      <Box as="main" className="container">
        {/* Profile Card */}
        <Box className="glass-card profile profile-card animate-fade-in" as="section">
          <HStack spacing={4} gap={4}>
            <Box position="relative">
              <Box className="avatar" display="flex" alignItems="center" justifyContent="center">
                {profile.initials}
              </Box>
              <Button
                className="avatar-camera-btn"
                onClick={openFilePicker}
                title="Trocar foto"
                p={0}
                minW="unset"
                h="28px"
                w="28px"
                bg="hsl(var(--primary))"
                _hover={{ opacity: 0.9 }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="absolute"
                bottom="-4px"
                right="-4px"
                borderRadius="50%"
              >
                <Icon as={EditIcon} boxSize={3} color="white" />
              </Button>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                display="none"
                accept="image/*"
              />
            </Box>
            <VStack align="flex-start" spacing={1}>
              <Heading as="h2" className="profile-name" size="md">
                {profile.displayName}
              </Heading>
              <Text className="profile-role">{profile.role}</Text>
              <HStack spacing={4} className="profile-meta">
                <Text>🏢 {profile.organization}</Text>
                <Text>🛡️ {profile.registration}</Text>
              </HStack>
            </VStack>
          </HStack>
        </Box>

        {/* Information Card */}
        <Box className="glass-card animate-fade-in" as="section">
          <Heading as="h3" className="section-title" size="sm" mb={4}>
            Informações
          </Heading>
          <Box className="info-grid">
            <Box>
              <Text as="label" color="hsl(var(--muted-foreground))" fontSize="13px">
                Nome completo
              </Text>
              <Text>{profile.fullName}</Text>
            </Box>
            <Box>
              <Text as="label" color="hsl(var(--muted-foreground))" fontSize="13px">
                E-mail
              </Text>
              <Text>{profile.email}</Text>
            </Box>
            <Box>
              <Text as="label" color="hsl(var(--muted-foreground))" fontSize="13px">
                Matrícula
              </Text>
              <Text fontFamily="monospace">{profile.registration}</Text>
            </Box>
            <Box>
              <Text as="label" color="hsl(var(--muted-foreground))" fontSize="13px">
                Cargo
              </Text>
              <Text>{profile.role}</Text>
            </Box>
            <Box>
              <Text as="label" color="hsl(var(--muted-foreground))" fontSize="13px">
                Órgão vinculado
              </Text>
              <Text>{profile.organization}</Text>
            </Box>
            <Box>
              <Text as="label" color="hsl(var(--muted-foreground))" fontSize="13px">
                Setor de atuação
              </Text>
              <Text>{profile.department}</Text>
            </Box>
          </Box>
        </Box>

        {/* Statistics Card */}
        <Box className="glass-card animate-fade-in" as="section">
          <Heading as="h3" className="section-title" size="sm" mb={4}>
            📊 Estatísticas
          </Heading>
          <Box className="stats-grid">
            <Box className="stat-box">
              <Text className="stat-number">{profile.stats.managedTickets}</Text>
              <Text className="stat-label">Chamados gerenciados</Text>
            </Box>
            <Box className="stat-box">
              <Text className="stat-number">{profile.stats.avgResolutionHours}h</Text>
              <Text className="stat-label">Tempo médio resolução</Text>
            </Box>
            <Box className="stat-box">
              <Text className="stat-number success">
                {profile.stats.slaCompliancePct}%
              </Text>
              <Text className="stat-label">Cumprimento de SLA</Text>
            </Box>
          </Box>
        </Box>

        {/* Notifications Card */}
        <Box className="glass-card animate-fade-in" as="section">
          <Heading as="h3" className="section-title" size="sm" mb={4}>
            🔔 Notificações
          </Heading>
          <VStack className="notif-list" spacing={0}>
            {profile.notifications.map((item) => (
              <HStack
                key={item.id}
                className="notif-row"
                justify="space-between"
                py={3}
                px={0}
                borderBottom="1px solid hsl(var(--border))"
                w="full"
                _last={{ borderBottom: 'none' }}
              >
                <Text>{item.label}</Text>
                <HStack spacing={4} className="notif-actions">
                  <Checkbox
                    isChecked={item.email}
                    onChange={(e) =>
                      updateNotificationPref(item.id, 'email', e.target.checked)
                    }
                    colorScheme="blue"
                  >
                    E-mail
                  </Checkbox>
                  <Checkbox
                    isChecked={item.system}
                    onChange={(e) =>
                      updateNotificationPref(item.id, 'system', e.target.checked)
                    }
                    colorScheme="blue"
                  >
                    Sistema
                  </Checkbox>
                </HStack>
              </HStack>
            ))}
          </VStack>
        </Box>

        {/* Change Password Card */}
        <Box className="glass-card animate-fade-in" as="section">
          <Heading as="h3" className="section-title" size="sm" mb={4}>
            🔒 Alterar Senha
          </Heading>
          <VStack
            className="password-form"
            as="form"
            onSubmit={handlePasswordSubmit}
            spacing={3}
          >
            <Input
              type="password"
              className="input"
              placeholder="Senha atual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Input
              type="password"
              className="input"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Input
              type="password"
              className="input"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Button
              type="submit"
              className="btn-primary"
              isDisabled={isSubmitting}
              alignSelf="flex-start"
              bg="hsl(var(--primary))"
              color="white"
              _hover={{ opacity: 0.9 }}
              _disabled={{ opacity: 0.6 }}
            >
              {isSubmitting ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </VStack>
        </Box>
      </Box>

      {/* Toast Notification */}
      {toastMessage && (
        <Box
          position="fixed"
          bottom="20px"
          right="20px"
          p="12px 16px"
          borderRadius="8px"
          bg={
            toastType === 'success'
              ? 'hsl(var(--status-progress))'
              : 'hsl(0 84% 60%)'
          }
          color="white"
          fontSize="14px"
          fontWeight={500}
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          animation="fade-in 0.4s ease-out"
          zIndex={50}
        >
          {toastMessage}
        </Box>
      )}
    </Box>
  );
}
