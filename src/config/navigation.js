import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Video, 
  HeartHandshake, 
  Music, 
  Megaphone, 
  MessageCircle, 
  MapPin, 
  User, 
  Settings 
} from 'lucide-react'

export const DASHBOARD_NAV = [
  { label: 'Visão Geral', path: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Eventos', path: '/dashboard/eventos', icon: Calendar },
  { label: 'Bíblia', path: '/dashboard/biblia', icon: BookOpen },
  { label: 'Ao Vivo', path: '/dashboard/transmissao', icon: Video },
  { label: 'Devocional', path: '/dashboard/devocional', icon: HeartHandshake },
  { label: 'Louvores', path: '/dashboard/louvores', icon: Music },
  { label: 'Avisos', path: '/dashboard/avisos', icon: Megaphone },
  { label: 'Chat', path: '/dashboard/chat', icon: MessageCircle },
  { label: 'Localização', path: '/dashboard/localizacao', icon: MapPin },
]

export const USER_NAV = [
  { label: 'Meu Perfil', path: '/dashboard/perfil', icon: User },
  { label: 'Configurações', path: '/dashboard/settings', icon: Settings },
]