import { ref, computed } from 'vue'

// Resources data — dynamic JavaScript data structure for BR B.2
const resourcesData = ref([
  {
    id: 1,
    title: 'Understanding Anxiety: A Comprehensive Guide',
    category: 'anxiety',
    type: 'article',
    author: 'Dr. Emily Chen',
    excerpt: 'Learn about the different types of anxiety disorders, their symptoms, and evidence-based coping strategies that you can start using today.',
    content: 'Anxiety is one of the most common mental health conditions affecting millions of people worldwide. It manifests in various forms including Generalized Anxiety Disorder (GAD), Panic Disorder, Social Anxiety, and specific phobias...',
    image: '',
    readTime: '8 min',
    featured: true,
    date: '2024-08-15',
    tags: ['anxiety', 'self-help', 'beginner']
  },
  {
    id: 2,
    title: 'Mindfulness Meditation for Beginners',
    category: 'mindfulness',
    type: 'guide',
    author: 'James Wilson, LCSW',
    excerpt: 'Discover the power of mindfulness meditation. This step-by-step guide will help you start a practice that can reduce stress and improve your mental wellbeing.',
    content: 'Mindfulness is the practice of being fully present and engaged in the current moment, aware of your thoughts and feelings without judgment...',
    image: '',
    readTime: '12 min',
    featured: true,
    date: '2024-09-02',
    tags: ['mindfulness', 'meditation', 'beginner']
  },
  {
    id: 3,
    title: 'Recognizing Depression: Signs, Symptoms, and When to Seek Help',
    category: 'depression',
    type: 'article',
    author: 'Dr. Sarah Thompson',
    excerpt: 'Depression affects people differently. This article helps you recognize the signs and understand when it is time to reach out for professional support.',
    content: 'Depression is more than just feeling sad. It is a complex mental health condition that affects how you think, feel, and handle daily activities...',
    image: '',
    readTime: '10 min',
    featured: true,
    date: '2024-08-28',
    tags: ['depression', 'self-help', 'intermediate']
  },
  {
    id: 4,
    title: 'Sleep Hygiene: Building Healthy Sleep Habits',
    category: 'wellness',
    type: 'guide',
    author: 'Dr. Michael Brown',
    excerpt: 'Good sleep is fundamental to mental health. Explore practical tips for improving your sleep quality and establishing a healthy sleep routine.',
    content: 'Sleep and mental health are deeply interconnected. Poor sleep can contribute to mental health issues, and mental health conditions can disrupt sleep...',
    image: '',
    readTime: '7 min',
    featured: false,
    date: '2024-09-10',
    tags: ['sleep', 'wellness', 'self-care', 'beginner']
  },
  {
    id: 5,
    title: 'Coping with Stress: Strategies That Work',
    category: 'stress',
    type: 'article',
    author: 'Lisa Martinez, Psychologist',
    excerpt: 'Workplace stress, academic pressure, and life challenges can feel overwhelming. Here are proven techniques for managing stress effectively.',
    content: 'Stress is a natural human response to challenging situations. While some stress can be motivating, chronic stress can have serious effects on both physical and mental health...',
    image: '',
    readTime: '9 min',
    featured: false,
    date: '2024-08-20',
    tags: ['stress', 'self-help', 'intermediate']
  },
  {
    id: 6,
    title: 'Supporting a Loved One with Mental Illness',
    category: 'support',
    type: 'guide',
    author: 'Dr. Emily Chen',
    excerpt: 'When someone you care about is struggling with mental health, knowing how to help can be challenging. This guide provides practical advice for being a supportive ally.',
    content: 'Supporting someone with a mental illness requires patience, understanding, and knowledge. Your role is not to fix them but to be present and supportive...',
    image: '',
    readTime: '11 min',
    featured: false,
    date: '2024-09-05',
    tags: ['support', 'family', 'relationships']
  },
  {
    id: 7,
    title: 'The Power of Exercise for Mental Health',
    category: 'wellness',
    type: 'article',
    author: 'James Wilson, LCSW',
    excerpt: 'Physical activity is one of the most effective natural treatments for improving mood and reducing symptoms of anxiety and depression.',
    content: 'Research consistently shows that regular physical activity has profound effects on mental health. Exercise releases endorphins, reduces stress hormones, and improves sleep...',
    image: '',
    readTime: '6 min',
    featured: false,
    date: '2024-09-15',
    tags: ['exercise', 'wellness', 'self-care', 'beginner']
  },
  {
    id: 8,
    title: 'Understanding PTSD and Trauma Recovery',
    category: 'ptsd',
    type: 'article',
    author: 'Dr. Sarah Thompson',
    excerpt: 'Post-Traumatic Stress Disorder affects many individuals who have experienced trauma. Learn about the recovery journey and available treatment options.',
    content: 'PTSD can develop after experiencing or witnessing a traumatic event. It is important to understand that recovery is possible with the right support and treatment...',
    image: '',
    readTime: '13 min',
    featured: false,
    date: '2024-08-10',
    tags: ['ptsd', 'trauma', 'recovery', 'advanced']
  },
  {
    id: 9,
    title: 'Nutrition and Mental Health: The Gut-Brain Connection',
    category: 'wellness',
    type: 'guide',
    author: 'Lisa Martinez, Psychologist',
    excerpt: 'What you eat affects how you feel. Explore the fascinating connection between nutrition, gut health, and your mental wellbeing.',
    content: 'The gut-brain axis is a bidirectional communication system between your digestive system and your brain. Emerging research shows that gut health plays a significant role in mental health...',
    image: '',
    readTime: '8 min',
    featured: false,
    date: '2024-09-20',
    tags: ['nutrition', 'wellness', 'self-care', 'intermediate']
  },
  {
    id: 10,
    title: 'Building Resilience: Bouncing Back from Adversity',
    category: 'resilience',
    type: 'article',
    author: 'Dr. Michael Brown',
    excerpt: 'Resilience is not about avoiding difficulties — it is about developing the strength to cope and grow through challenges. Learn how to build your psychological resilience.',
    content: 'Resilience is the ability to adapt well in the face of adversity, trauma, tragedy, threats, or significant sources of stress...',
    image: '',
    readTime: '10 min',
    featured: false,
    date: '2024-09-25',
    tags: ['resilience', 'self-help', 'intermediate']
  }
])

const categories = [
  { key: 'all', label: 'All Topics' },
  { key: 'anxiety', label: 'Anxiety' },
  { key: 'depression', label: 'Depression' },
  { key: 'stress', label: 'Stress' },
  { key: 'mindfulness', label: 'Mindfulness' },
  { key: 'ptsd', label: 'PTSD & Trauma' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'support', label: 'Supporting Others' },
  { key: 'resilience', label: 'Resilience' }
]

export function useResourcesStore() {
  const searchQuery = ref('')
  const selectedCategory = ref('all')

  const filteredResources = computed(() => {
    let result = resourcesData.value

    if (selectedCategory.value !== 'all') {
      result = result.filter(r => r.category === selectedCategory.value)
    }

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      result = result.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.excerpt.toLowerCase().includes(query) ||
        r.tags.some(tag => tag.toLowerCase().includes(query)) ||
        r.author.toLowerCase().includes(query)
      )
    }

    return result
  })

  function getResourceById(id) {
    return resourcesData.value.find(r => r.id === parseInt(id))
  }

  function getFeaturedResources() {
    return resourcesData.value.filter(r => r.featured)
  }

  return {
    resources: resourcesData,
    categories,
    searchQuery,
    selectedCategory,
    filteredResources,
    getResourceById,
    getFeaturedResources
  }
}
