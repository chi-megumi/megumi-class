export interface NavItem {
  label: string
  href: string
  badge?: string
}

export interface PolaroidPhoto {
  id: string
  title: string
  caption: string
  imageSrc: string
  imageAlt: string
  tiltDeg: number
  topPercent?: number
  bottomPercent?: number
  leftPercent?: number
  rightPercent?: number
  zIndex: number
  badgeText?: string
}

export interface StatItem {
  id: string
  iconName:
    | 'GraduationCap'
    | 'Users'
    | 'Sparkles'
    | 'Trophy'
    | 'Clock'
    | 'Heart'
    | 'Award'
    | 'BookCheck'
  value: number
  suffix: string
  label: string
  sublabel: string
}

export interface FeatureItem {
  id: string
  iconName: 'BookOpen' | 'Brain' | 'Flame' | 'Target' | 'Compass' | 'ShieldCheck'
  title: string
  description: string
  tag: string
  colorVariant: 'primary' | 'secondary' | 'accent' | 'warning'
}

export interface TeacherAchievement {
  id: string
  iconName: 'Award' | 'BookCheck' | 'Sparkles' | 'Users'
  value: string
  label: string
  description: string
}

export interface TeacherInfo {
  name: string
  role: string
  tagline: string
  quote: string
  imageSrc: string
  imageAlt: string
  experienceYears: number
  bioParagraphs: string[]
  credentials: string[]
  achievements: TeacherAchievement[]
  socialLinks: {
    platform: 'facebook' | 'zalo' | 'tiktok' | 'youtube'
    label: string
    url: string
  }[]
}

export interface MethodStep {
  stepNumber: number
  title: string
  subtitle: string
  description: string
  highlights: string[]
  iconName: 'Sparkles' | 'Layers' | 'MessageSquareQuote' | 'TrendingUp'
}

export interface TestimonialItem {
  id: string
  name: string
  role: string
  achievement: string
  rating: number
  content: string
  avatarInitials: string
  avatarColor: string
  avatarImage?: string
  targetCourse: string
}

export interface ContactInfoData {
  phone: string
  hotlineFormatted: string
  email: string
  address: string
  workingHours: string
  zaloLink: string
  facebookLink: string
  responseTime: string
}

export interface ContactFormData {
  fullName: string
  phone: string
  email: string
  course: string
  learningGoal: string
}

export interface ContactFormErrors {
  fullName?: string
  phone?: string
  email?: string
  course?: string
  learningGoal?: string
}
