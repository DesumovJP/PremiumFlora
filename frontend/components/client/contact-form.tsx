"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", phone: "", email: "", message: "" });
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <Card className="border-emerald-100 bg-emerald-50/50">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
          <h3 className="mb-2 text-xl font-semibold text-slate-900">Дякуємо за звернення!</h3>
          <p className="text-slate-600">
            Ми отримали ваше повідомлення і зв'яжемося з вами найближчим часом.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="contact" className="border-none bg-white/80 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Зв'яжіться з нами</CardTitle>
        <CardDescription>
          Заповніть форму, і наш менеджер зв'яжеться з вами для обговорення умов співпраці
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-900">
                Ім'я *
              </label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ваше ім'я"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-900">
                Телефон *
              </label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+380 XX XXX XX XX"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-900">
              Email *
            </label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-900">
              Повідомлення
            </label>
            <textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Опишіть ваші потреби або залиште питання..."
              className="flex w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-400 resize-none"
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              "Відправка..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Відправити повідомлення
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}






