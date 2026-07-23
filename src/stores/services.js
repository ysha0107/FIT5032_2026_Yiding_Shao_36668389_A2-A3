import { ref } from 'vue'

// Services data — dynamic JavaScript data structure
const servicesData = ref([
  {
    id: 1,
    name: 'Individual Counselling',
    category: 'therapy',
    description: 'One-on-one counselling sessions with qualified mental health professionals, available both in-person and via telehealth.',
    fullDescription: 'Our individual counselling service provides a safe, confidential space where you can explore your thoughts, feelings, and challenges with a trained mental health professional. Each session is tailored to your specific needs and goals. Our therapists use evidence-based approaches including Cognitive Behavioral Therapy (CBT), Dialectical Behavior Therapy (DBT), and person-centered therapy.',
    icon: '🧠',
    price: 'Sliding scale from $40',
    availability: 'Mon-Sat, 8am-8pm',
    location: 'Both in-person & online',
    features: ['50-minute sessions', 'Licensed therapists', 'Flexible scheduling', 'Confidential', 'Bulk billing available']
  },
  {
    id: 2,
    name: 'Support Groups',
    category: 'community',
    description: 'Connect with others who understand what you are going through in a safe, facilitated group environment.',
    fullDescription: 'Our support groups bring together individuals facing similar challenges in a structured, supportive environment. Led by trained facilitators, these groups provide a space to share experiences, learn coping strategies, and build meaningful connections. We offer groups for anxiety, depression, grief, trauma recovery, and more.',
    icon: '🤝',
    price: 'Free',
    availability: 'Various times throughout the week',
    location: 'In-person & online',
    features: ['Small groups (8-12 people)', 'Professional facilitation', 'Peer support', 'Weekly sessions', 'Free of charge']
  },
  {
    id: 3,
    name: 'Crisis Helpline — 24/7 Support',
    category: 'crisis',
    description: 'Immediate, confidential support available 24 hours a day, 7 days a week. You are never alone.',
    fullDescription: 'Our 24/7 Crisis Helpline provides immediate emotional support for anyone experiencing a mental health crisis. Staffed by trained crisis counselors, we are here to listen without judgment and help you navigate through difficult moments. Whether you are feeling suicidal, experiencing a panic attack, or just need someone to talk to — we are here.',
    icon: '📞',
    price: 'Free',
    availability: '24/7, 365 days a year',
    location: 'Phone & online chat',
    features: ['Immediate response', 'Trained crisis counselors', 'Completely confidential', 'No appointment needed', 'Follow-up support available']
  },
  {
    id: 4,
    name: 'Youth Mental Health Program',
    category: 'youth',
    description: 'Specialised mental health services designed for young people aged 12-25, addressing the unique challenges of adolescence and young adulthood.',
    fullDescription: 'Our Youth Mental Health Program provides age-appropriate mental health services for young people aged 12-25. We understand the unique pressures facing young people today — from academic stress and social media pressures to identity exploration and family dynamics. Our youth-friendly approach makes seeking help accessible and engaging.',
    icon: '🌟',
    price: 'Free for under 18s; sliding scale for 18-25',
    availability: 'Mon-Fri, 9am-6pm',
    location: 'In-person, online & school-based',
    features: ['Age-appropriate care', 'School outreach programs', 'Family involvement options', 'Peer support programs', 'Educational workshops']
  },
  {
    id: 5,
    name: 'Workplace Mental Health Training',
    category: 'education',
    description: 'Comprehensive mental health training programs for organizations looking to create mentally healthy workplaces.',
    fullDescription: 'Our workplace training programs help organizations build mentally healthy workplaces through education, policy development, and practical tools. We offer Mental Health First Aid certification, manager training on supporting employee mental health, stress management workshops, and customized programs tailored to your workplace needs.',
    icon: '🏢',
    price: 'Contact for pricing',
    availability: 'Flexible scheduling',
    location: 'On-site & online',
    features: ['Mental Health First Aid', 'Manager training', 'Policy consultation', 'Custom programs', 'Ongoing support']
  },
  {
    id: 6,
    name: 'Online Self-Help Toolkit',
    category: 'self-help',
    description: 'Access evidence-based self-help resources, interactive tools, and guided exercises anytime, anywhere.',
    fullDescription: 'Our Online Self-Help Toolkit provides a comprehensive collection of digital resources you can use at your own pace. Includes guided meditation audio tracks, mood tracking tools, cognitive restructuring worksheets, journaling prompts, breathing exercise animations, and personalized wellness plans. All content is developed by mental health professionals and based on clinical evidence.',
    icon: '📱',
    price: 'Free',
    availability: 'Available 24/7 online',
    location: 'Online',
    features: ['Guided meditations', 'Mood tracking', 'CBT worksheets', 'Breathing exercises', 'Wellness planning']
  }
])

const serviceCategories = [
  { key: 'all', label: 'All Services' },
  { key: 'therapy', label: 'Therapy' },
  { key: 'crisis', label: 'Crisis Support' },
  { key: 'community', label: 'Community' },
  { key: 'youth', label: 'Youth' },
  { key: 'education', label: 'Education' },
  { key: 'self-help', label: 'Self-Help' }
]

export function useServicesStore() {
  function getServiceById(id) {
    return servicesData.value.find(s => s.id === parseInt(id))
  }

  function getAllServices() {
    return servicesData.value
  }

  function getServicesByCategory(category) {
    if (!category || category === 'all') return servicesData.value
    return servicesData.value.filter(s => s.category === category)
  }

  return {
    services: servicesData,
    serviceCategories,
    getServiceById,
    getAllServices,
    getServicesByCategory
  }
}
