import { Link } from 'react-router-dom';
import { useTranslation } from '@/translations';
import { getLocalizedSectionValue } from '@/translations/helpers';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Trophy,
  Calendar,
  Award,
  TrendingUp,
  Heart,
  Sparkles,
  ArrowRight,
  Star
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/app/config';

export function Home() {
  const { t, language } = useTranslation();
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    experience: 0,
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/sections/home?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => setContent(data.content || {}))
      .catch(() => {});
  }, []);

  const g = (section: string, key: string, fallback: string) => getLocalizedSectionValue(content, section, key, language, fallback);

  // Animated counter effect
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    const targets = {
      students: parseInt(g('stats', 'students_num', '850')) || 850,
      teachers: parseInt(g('stats', 'teachers_num', '45')) || 45,
      classes: parseInt(g('stats', 'grades_num', '33')) || 33,
      experience: parseInt(g('stats', 'years_num', '25')) || 25,
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setStats({
        students: Math.floor(targets.students * progress),
        teachers: Math.floor(targets.teachers * progress),
        classes: Math.floor(targets.classes * progress),
        experience: Math.floor(targets.experience * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setStats(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [content]);

  const features = [
    {
      icon: BookOpen,
      title: t.home.qualityEducation,
      description: t.home.qualityEducationDesc,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Users,
      title: t.home.experiencedTeachers,
      description: t.home.experiencedTeachersDesc,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: Calendar,
      title: t.home.structuredSchedule,
      description: t.home.structuredScheduleDesc,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: Trophy,
      title: t.home.studentExcellence,
      description: t.home.studentExcellenceDesc,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      gradient: 'from-orange-500 to-orange-600',
    },
  ];

  const achievements = [
    { icon: Award, label: g('achievements', 'card1_label', t.home.achievementOlympiad), value: g('achievements', 'card1_value', '15+'), accent: 'achievement-card--amber' },
    { icon: TrendingUp, label: g('achievements', 'card2_label', t.home.achievementGrowth), value: g('achievements', 'card2_value', '95%'), accent: 'achievement-card--emerald' },
    { icon: Heart, label: g('achievements', 'card3_label', t.home.achievementParents), value: g('achievements', 'card3_value', '98%'), accent: 'achievement-card--rose' },
    { icon: Star, label: g('achievements', 'card4_label', t.home.achievementRank), value: g('achievements', 'card4_value', 'Top 10'), accent: 'achievement-card--indigo' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 pt-24 pb-12">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[28rem] h-[28rem] bg-blue-400/20 rounded-full blur-3xl -top-44 -left-32 animate-pulse-slow" />
          <div className="absolute w-[32rem] h-[32rem] bg-blue-300/10 rounded-full blur-3xl -bottom-44 -right-24 animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA0IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-45" />
        </div>

        <div className="container-custom relative z-10 py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white space-y-8 max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/12 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">{t.home.badge}</span>
              </motion.div>

              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.06] tracking-tight drop-shadow-[0_8px_18px_rgba(0,0,0,0.26)]"
                >
                  {g('hero', 'title', '28-Maktab')}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200">
                    {t.home.titleSecondLine}
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl text-blue-100/95 leading-relaxed"
                >
                  {g('hero', 'subtitle', t.home.subtitle)}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  {g('hero', 'primary_button', t.home.learnMore)}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/14 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/22 transition-all duration-300 border border-white/25"
                >
                  {g('hero', 'secondary_button', t.home.contact)}
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-end gap-8 pt-10"
              >
                {[
                  { value: stats.students, label: g('stats', 'students_label', t.home.students), suffix: '+' },
                  { value: stats.teachers, label: g('stats', 'teachers_label', t.home.teachers), suffix: '+' },
                  { value: stats.classes, label: g('stats', 'grades_label', t.home.classes), suffix: '' },
                  { value: stats.experience, label: g('stats', 'years_label', t.home.experience), suffix: '+' },
                ].map((stat, index) => (
                  <div key={index} className="min-w-[92px]">
                    <div className="text-4xl md:text-5xl font-extrabold text-white mb-1 leading-none">
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-sm text-blue-100/90">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-20, 20, -20] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-7 right-6 w-24 h-24 bg-white/12 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center shadow-xl"
                >
                  <GraduationCap className="w-12 h-12 text-white" />
                </motion.div>
                <motion.div
                  animate={{ y: [20, -20, 20] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-16 left-10 w-20 h-20 bg-white/12 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center shadow-xl"
                >
                  <BookOpen className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div
                  animate={{ y: [-15, 15, -15] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute top-[56%] -left-4 w-16 h-16 bg-white/12 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center shadow-lg"
                >
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </motion.div>
                
                {/* Main Illustration Circle */}
                <div className="w-96 h-96 mx-auto relative">
                  <div className="absolute inset-0 rounded-full border border-white/20" />
                  <div className="absolute inset-6 bg-white/5 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center">
                    <GraduationCap className="w-44 h-44 text-cyan-200/90" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute right-8 bottom-8 text-white/80 hidden md:block">
          <Star className="w-10 h-10" />
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gradient-to-b from-neutral-50 to-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              {t.home.whyUs}
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              {t.home.welcomeDesc}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full bg-white rounded-2xl p-8 shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border border-neutral-100">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="achievements-section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="achievements-header"
          >
            <span className="achievements-kicker">{t.home.achievementsKicker}</span>
            <h2 className="achievements-title">
              {t.home.achievementsTitle}
            </h2>
            <p className="achievements-subtitle">
              {t.home.achievementsSubtitle}
            </p>
          </motion.div>

          <div className="achievements-grid">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`achievement-card ${achievement.accent}`}
              >
                <div className="achievement-icon">
                  <achievement.icon className="w-7 h-7" />
                </div>
                <div className="achievement-value">{achievement.value}</div>
                <div className="achievement-label">{achievement.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                {g('cta', 'title', t.home.joinTitle)}
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {g('cta', 'desc', t.home.joinDesc)}
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1"
              >
                {t.home.contact}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
