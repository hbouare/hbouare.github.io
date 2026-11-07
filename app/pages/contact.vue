<!-- app/pages/contact.vue -->
<!--
  Contact: who and where on the left, the form on the right. Native HTML5
  validation (required, type=email) — no JS validation layer to keep in sync.
  States: idle → sending → sent | error. No confirm dialog (removed on
  purpose); a hidden honeypot field silently drops bot submissions.
  No CTA band on this page: it IS the destination.
-->
<template>
  <section class="contact gutter">
    <div class="contact-side">
      <div class="eyebrow">{{ $t("contact.section") }}</div>
      <i18n-t scope="global" keypath="contact.title" tag="h1" class="t-h1">
        <template #em>
          <em class="em-accent">{{ $t("contact.title_em") }}</em>
        </template>
      </i18n-t>
      <p class="t-intro contact-desc">{{ $t("contact.desc") }}</p>
      <div class="status contact-avail">{{ $t("footer.available") }}</div>

      <div class="contact-links">
        <div class="label contact-links-label">{{ $t("contact.socials") }}</div>
        <a href="https://github.com/hbouare" target="_blank" rel="noopener">
          <span>GitHub</span><span class="contact-handle">hbouare ↗</span>
        </a>
        <a href="https://www.linkedin.com/in/hamed-bouare-phd-0a1981112/" target="_blank" rel="noopener">
          <span>LinkedIn</span><span class="contact-handle">hamed-bouare-phd ↗</span>
        </a>
      </div>
    </div>

    <div class="contact-main">
      <div v-if="state === 'sent'" class="contact-panel" role="status">
        <div class="label sent-label">{{ $t("contact.sent_label") }}</div>
        <div class="sent-text">{{ $t("contact.sent_text") }}</div>
        <button type="button" class="link-text sent-again" @click="reset">
          {{ $t("contact.sent_again") }}
        </button>
      </div>

      <form v-else class="contact-panel contact-form" @submit.prevent="submit">
        <div class="form-row">
          <label class="field">
            <span class="label">{{ $t("contact.form_name") }}</span>
            <input v-model="form.name" required name="name" autocomplete="name" :placeholder="$t('contact.form_name')">
          </label>
          <label class="field">
            <span class="label">{{ $t("contact.form_email") }}</span>
            <input
              v-model="form.email"
              required
              type="email"
              name="email"
              autocomplete="email"
              :placeholder="$t('contact.form_email')"
            >
          </label>
        </div>

        <fieldset class="topics">
          <legend class="label">{{ $t("contact.form_subject") }}</legend>
          <div class="topics-list">
            <button
              v-for="tp in topicOptions"
              :key="tp"
              type="button"
              class="chip topic"
              :aria-pressed="topics.includes(tp) ? 'true' : 'false'"
              @click="toggleTopic(tp)"
            >
              {{ tp }}
            </button>
          </div>
        </fieldset>

        <label class="field">
          <span class="label">{{ $t("contact.form_message") }}</span>
          <textarea
            v-model="form.message"
            required
            name="message"
            rows="6"
            :placeholder="$t('contact.message_placeholder')"
          />
        </label>

        <!-- Honeypot: invisible to people, irresistible to bots. -->
        <input
          v-model="trap"
          class="hb-trap"
          type="text"
          name="hb-trap"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
        >

        <p v-if="state === 'error'" class="form-error" role="alert">{{ $t("contact.form_error") }}</p>

        <button type="submit" class="btn btn--primary form-submit" :disabled="state === 'sending'">
          {{ state === "sending" ? $t("contact.form_sending") : $t("contact.form_send") }}
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import emailjs from "@emailjs/browser"

const { t, tm, rt } = useI18n()
const config = useRuntimeConfig()

useSeoMeta({
  title: "Contact",
  description: t("contact.desc"),
  ogTitle: "Contact - Hamed Bouare",
  ogDescription: t("contact.desc"),
})

type State = "idle" | "sending" | "sent" | "error"
const state = ref<State>("idle")

const form = reactive({ name: "", email: "", message: "" })
const trap = ref("")

const topicOptions = computed(() => (tm("contact.topics") as unknown[]).map((m) => rt(m as string)))
const topics = ref<string[]>([])
const toggleTopic = (tp: string) => {
  topics.value = topics.value.includes(tp)
    ? topics.value.filter((x) => x !== tp)
    : [...topics.value, tp]
}

const submit = async () => {
  if (state.value === "sending") return
  // A bot filled the honeypot: pretend it worked, send nothing.
  if (trap.value) {
    state.value = "sent"
    return
  }
  state.value = "sending"
  const subject = topics.value.join(", ")
  try {
    await emailjs.send(
      config.public.emailjsServiceId as string,
      config.public.emailjsTemplateId as string,
      {
        title: `Message de ${form.name}${subject ? ` — ${subject}` : ""}`,
        name: form.name,
        email: form.email,
        topics: subject,
        // Topics are also prefixed to the body, so they arrive even with a
        // template that has no {{topics}} slot.
        message: subject ? `[${subject}]\n\n${form.message}` : form.message,
        time: new Date().toLocaleString(),
      },
      config.public.emailjsPublicKey as string,
    )
    state.value = "sent"
  } catch {
    state.value = "error"
  }
}

const reset = () => {
  form.name = ""
  form.email = ""
  form.message = ""
  topics.value = []
  state.value = "idle"
}
</script>

<style scoped>
.contact {
  display: flex;
  flex-wrap: wrap;
  gap: 48px 80px;
  padding-top: clamp(56px, 8vw, 120px);
  padding-bottom: var(--section-y);
}

.contact-side {
  flex: 1 1 380px;
  display: flex;
  flex-direction: column;
  gap: clamp(20px, 2.4vw, 32px);
}
.contact-desc {
  max-width: 520px;
}
.contact-avail {
  font-family: var(--f-mono);
  font-size: 12px;
}
.contact-links {
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  border-top: 1px solid var(--rule);
}
.contact-links-label {
  padding: 14px 0 6px;
}
.contact-links a {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--rule);
  font-size: 16px;
  transition: color 0.2s;
}
.contact-links a:hover {
  color: var(--accent);
}
.contact-handle {
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--muted);
}

.contact-main {
  flex: 1.3 1 420px;
  min-width: 0;
}
.contact-panel {
  display: flex;
  flex-direction: column;
  padding: clamp(24px, 3.4vw, 48px);
  border: 1px solid var(--rule);
  border-radius: var(--radius-card);
  background: var(--surface);
  transition: background-color 0.35s;
}
.contact-form {
  gap: 28px;
}
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 28px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field input,
.field textarea {
  font: inherit;
  font-size: 18px;
  color: var(--ink);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--ink);
  border-radius: 0;
  padding: 10px 0;
  min-height: 44px;
  outline-offset: 4px;
}
.field textarea {
  line-height: 1.55;
  resize: vertical;
}

.topics {
  border: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.topics legend {
  padding: 0 0 10px;
}
.topics-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.topic {
  font-family: var(--f-sans);
  font-size: 14px;
}

.hb-trap {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.form-error {
  margin: 0;
  font-size: 15px;
  color: var(--error);
}
.form-submit {
  align-self: flex-start;
  padding: 0 26px;
}
.form-submit:disabled {
  opacity: 0.6;
  cursor: progress;
}

.contact-panel[role="status"] {
  gap: 16px;
}
.sent-label {
  color: var(--accent);
}
.sent-text {
  font-family: var(--f-display);
  font-weight: 300;
  font-size: clamp(28px, 3vw, 40px);
  line-height: 1.15;
}
.sent-again {
  align-self: flex-start;
  font: inherit;
  font-size: 15px;
  color: var(--ink);
  background: none;
  border: none;
  border-bottom: 1px solid currentColor;
  cursor: pointer;
}
</style>
