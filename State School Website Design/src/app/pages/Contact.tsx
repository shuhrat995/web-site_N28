import { useEffect, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { AlertCircle, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useTranslation } from '@/translations';
import { getLocalizedSectionValue } from '@/translations/helpers';
import { API_BASE_URL } from '@/app/config';

type ContactContent = Record<string, Record<string, string>>;

export function Contact() {
  const { t, language } = useTranslation();
  const [content, setContent] = useState<ContactContent>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/sections/contact?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => setContent(data.content || {}))
      .catch(() => { });
  }, []);

  const g = (section: string, key: string, fallback: string) =>
    getLocalizedSectionValue(content, section, key, language, fallback);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = t.contact.errors.nameRequired;
    if (!formData.email.trim()) newErrors.email = t.contact.errors.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t.contact.errors.invalidEmail;
    if (!formData.subject) newErrors.subject = t.contact.errors.subjectRequired;
    if (!formData.message.trim()) newErrors.message = t.contact.errors.messageRequired;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t.contact.errors.fixErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t.contact.errors.success);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setErrors({});
      } else {
        toast.error(data.error || t.contact.errors.failed);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(t.contact.errors.network);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const subjectOptions = [
    ['admissions', t.contact.admissionsInquiry],
    ['general', t.contact.generalInformation],
    ['academics', t.contact.academicPrograms],
    ['enrollment', t.contact.enrollmentQuestions],
    ['facilities', t.contact.facilitiesTours],
    ['other', t.contact.other],
  ];

  const mapValue = g('info', 'map', '');
  const defaultMapUrl = `https://www.google.com/maps?q=41.46027257300891,60.80300124819984&output=embed`;

  return (
    <div>
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{g('hero', 'title', t.contact.title)}</h1>
          <p className="text-lg text-blue-100 max-w-3xl">{g('hero', 'subtitle', t.contact.subtitle)}</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t.contact.information}</h2>
              <div className="space-y-6">
                <ContactInfoRow icon={MapPin} color="blue" title={t.contact.address}>
                  {g('info', 'address', t.footer.addressValue)}
                </ContactInfoRow>
                <ContactInfoRow icon={Phone} color="green" title={t.contact.phone}>
                  {t.contact.mainOffice}: {g('info', 'phone', '+998 71 123 45 67')}<br />
                  {t.contact.telegram}: {g('info', 'telegram', '@school28')}
                </ContactInfoRow>
                <ContactInfoRow icon={Mail} color="purple" title={t.contact.email}>
                  {t.contact.general}: {g('info', 'email', 'info@school28.uz')}
                </ContactInfoRow>
                <ContactInfoRow icon={Clock} color="orange" title={t.contact.officeHours}>
                  {g('info', 'hours', t.footer.monFri)}
                </ContactInfoRow>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t.contact.sendMessage}</h2>
              <form id="contact-form" onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <FormInput
                    label={`${t.contact.fullName} *`}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t.contact.namePlaceholder}
                    error={errors.name}
                  />
                  <FormInput
                    label={`${t.contact.emailAddress} *`}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t.contact.emailPlaceholder}
                    error={errors.email}
                  />
                  <FormInput
                    label={t.contact.phoneNumber}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t.contact.phonePlaceholder}
                  />

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.contact.subject} *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.subject ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    >
                      <option value="">{t.contact.selectSubject}</option>
                      {subjectOptions.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    {errors.subject && <FieldError message={errors.subject} />}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.contact.message} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      placeholder={t.contact.messagePlaceholder}
                    />
                    {errors.message && <FieldError message={errors.message} />}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        {t.contact.sending}
                      </>
                    ) : (
                      <>
                        <Send className="size-5" />
                        {t.contact.send}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">{t.contact.mapTitle}</h2>
          <div className="bg-gray-200 rounded-lg overflow-hidden shadow-lg h-96 flex items-center justify-center">
            {mapValue || defaultMapUrl ? (
              <iframe
                title={t.contact.mapTitle}
                src={mapValue || defaultMapUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="text-center px-4">
                <MapPin className="size-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{g('info', 'address', t.footer.addressValue)}</p>
                <p className="text-sm text-gray-500 mt-2">{t.contact.mapPlaceholder}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t.contact.tourTitle}</h2>
          <p className="text-lg mb-6 text-green-50 max-w-2xl mx-auto">{t.contact.tourDesc}</p>
          <a href="#contact-form" className="bg-white text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg transition-colors inline-block font-semibold">
            {t.contact.requestTour}
          </a>
        </div>
      </section>
    </div>
  );
}

function ContactInfoRow({ icon: Icon, color, title, children }: { icon: any; color: string; title: string; children: ReactNode }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <motion.div className="flex items-start gap-4" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <div className={`${colorClasses[color]} p-3 rounded-lg flex-shrink-0`}>
        <Icon className="size-6" />
      </div>
      <div>
        <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-600">{children}</p>
      </div>
    </motion.div>
  );
}

function FormInput({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div>
      <label htmlFor={props.name} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input
        id={props.name}
        required={label.includes('*')}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        {...props}
      />
      {error && <FieldError message={error} />}
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
      <AlertCircle className="size-4" />
      {message}
    </p>
  );
}
