<template>
  <section id="contact" class="section-contact" style="border-bottom: none">
    <v-container class="px-6 px-md-10" fluid>
      <v-row>
        <!-- Left: title + description + social icons -->
        <v-col cols="12" md="5">
          <UiRevealBlock>
            <p class="font-mono text-primary section-label mb-4">
              {{ $t("contact.section") }}
            </p>
            <h1 class="contact-title font-playfair">
              {{ $t("contact.title_1") }}<br />
              <em class="text-primary">{{ $t("contact.title_em") }}</em>
            </h1>
            <p class="font-mono text-muted contact-desc mt-6">
              {{ $t("contact.desc") }}
            </p>

            <!-- Social icons -->
            <div class="mt-8">
              <p class="font-mono text-muted social-label mb-3">
                {{ $t("contact.socials") }}
              </p>
              <div class="d-flex ga-3">
                <v-btn
                  v-for="social in socials"
                  :key="social.icon"
                  :href="social.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  :icon="social.icon"
                  variant="outlined"
                  color="primary"
                  size="small"
                  rounded="0"
                />
              </div>
            </div>
          </UiRevealBlock>
        </v-col>

        <!-- Right: contact form -->
        <v-col cols="12" md="7">
          <UiRevealBlock :delay="200">
            <div class="contact-form-wrap">
              <v-form ref="formRef" @submit.prevent="submitForm">
                <v-text-field
                  v-model="form.name"
                  :label="$t('contact.form_name')"
                  variant="outlined"
                  color="primary"
                  base-color="muted"
                  bg-color="surface"
                  class="font-mono mb-1"
                  :rules="[rules.name]"
                  validate-on="blur"
                  density="comfortable"
                  rounded="0"
                />
                <v-text-field
                  v-model="form.email"
                  :label="$t('contact.form_email')"
                  variant="outlined"
                  color="primary"
                  base-color="muted"
                  bg-color="surface"
                  type="email"
                  class="font-mono mb-1"
                  :rules="[rules.email, rules.emailFormat]"
                  validate-on="blur"
                  density="comfortable"
                  rounded="0"
                />
                <v-textarea
                  v-model="form.message"
                  :label="$t('contact.form_message')"
                  variant="outlined"
                  color="primary"
                  base-color="muted"
                  bg-color="surface"
                  class="font-mono mb-2"
                  :rules="[rules.message]"
                  validate-on="blur"
                  rows="5"
                  auto-grow
                  density="comfortable"
                  rounded="0"
                />

                <!-- Honeypot: invisible to humans; bots tend to fill it. -->
                <input
                  v-model="form.honeypot"
                  class="hp-field"
                  type="text"
                  tabindex="-1"
                  autocomplete="off"
                  aria-hidden="true"
                />

                <!-- Feedback message -->
                <v-fade-transition>
                  <v-alert
                    v-if="sent"
                    type="success"
                    variant="tonal"
                    rounded="0"
                    class="font-mono mb-4"
                    density="compact"
                    icon="$checkCircle"
                  >
                    {{ $t("contact.form_success") }}
                  </v-alert>
                  <v-alert
                    v-else-if="errorMsg"
                    type="error"
                    variant="tonal"
                    rounded="0"
                    class="font-mono mb-4"
                    density="compact"
                    icon="$alertCircle"
                  >
                    {{ errorMsg }}
                  </v-alert>
                </v-fade-transition>

                <v-btn
                  type="submit"
                  color="primary"
                  variant="flat"
                  rounded="0"
                  size="large"
                  class="font-mono text-uppercase"
                  :loading="sending"
                  :disabled="!canSubmit"
                  append-icon="$arrowRight"
                >
                  {{ $t("contact.form_send") }}
                </v-btn>
              </v-form>
            </div>
          </UiRevealBlock>
        </v-col>
      </v-row>
    </v-container>

    <!-- Confirmation dialog -->
    <v-dialog v-model="showConfirm" max-width="440" persistent>
      <v-card color="surface" rounded="0" class="confirm-dialog">
        <v-card-title class="font-playfair text-primary pa-6 pb-2">
          {{ $t("contact.confirm_title") }}
        </v-card-title>
        <v-card-text class="font-mono text-muted pa-6 pt-2">
          {{ $t("contact.confirm_text") }}
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="muted"
            rounded="0"
            class="font-mono text-uppercase"
            @click="showConfirm = false"
          >
            {{ $t("contact.confirm_cancel") }}
          </v-btn>
          <v-btn
            variant="flat"
            color="primary"
            rounded="0"
            class="font-mono text-uppercase"
            :loading="sending"
            @click="sendEmail"
          >
            {{ $t("contact.confirm_send") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import emailjs from "@emailjs/browser"

const { t } = useI18n()
const config = useRuntimeConfig()

const formRef = ref()
const sending = ref(false)
const sent = ref(false)
const showConfirm = ref(false)
const errorMsg = ref("")

const form = reactive({
  name: "",
  email: "",
  message: "",
  honeypot: "",
})

// Throttle: block repeat sends within this window (anti-spam).
const MIN_SEND_INTERVAL_MS = 30_000
let lastSentAt = 0

const rules = {
  name: (v: string) => !!v?.trim() || t("contact.form_name_required"),
  email: (v: string) => !!v?.trim() || t("contact.form_email_required"),
  emailFormat: (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || t("contact.form_email_invalid"),
  message: (v: string) => !!v?.trim() || t("contact.form_message_required"),
}

const canSubmit = computed(() => {
  return (
    !!form.name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    !!form.message.trim()
  )
})

const socials = [
  { icon: "$github", href: "https://github.com/hamedbouare9" },
  {
    icon: "$linkedin",
    href: "https://www.linkedin.com/in/hamed-bouare-phd-0a1981112/",
  },
]

// Step 1: validate form, then show confirmation dialog
const submitForm = async () => {
  // Honeypot filled → automated submission, drop it silently.
  if (form.honeypot) return
  const { valid } = await formRef.value.validate()
  if (!valid) return
  showConfirm.value = true
}

// Step 2: send email via EmailJS after user confirms
const sendEmail = async () => {
  // Throttle repeated sends.
  if (Date.now() - lastSentAt < MIN_SEND_INTERVAL_MS) {
    showConfirm.value = false
    errorMsg.value = t("contact.form_throttle")
    setTimeout(() => {
      errorMsg.value = ""
    }, 5000)
    return
  }

  sending.value = true
  errorMsg.value = ""
  try {
    await emailjs.send(
      config.public.emailjsServiceId as string,
      config.public.emailjsTemplateId as string,
      {
        title: `Message de ${form.name}`,
        name: form.name,
        email: form.email,
        message: form.message,
        time: new Date().toLocaleString(),
      },
      config.public.emailjsPublicKey as string,
    )

    lastSentAt = Date.now()
    showConfirm.value = false
    sent.value = true
    form.name = ""
    form.email = ""
    form.message = ""
    form.honeypot = ""
    formRef.value.resetValidation()
    setTimeout(() => {
      sent.value = false
    }, 4000)
  } catch {
    showConfirm.value = false
    errorMsg.value = t("contact.form_error")
    setTimeout(() => {
      errorMsg.value = ""
    }, 5000)
  } finally {
    sending.value = false
  }
}
</script>

<style scoped lang="scss">
.section-contact {
  padding: 6.5rem 0;
  background: rgb(var(--v-theme-background));

  @media (max-width: 959px) {
    padding: 4.5rem 0;
  }
  @media (max-width: 599px) {
    padding: 3rem 0;
  }
}
.contact-title {
  font-size: clamp(44px, 5vw, 80px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  em {
    font-style: italic;
  }
}
.contact-desc {
  font-size: 0.8rem;
  line-height: 1.9;
}
.social-label {
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
:deep(.d-flex.ga-3 > .v-btn--variant-outlined .v-btn__overlay) {
  opacity: 0 !important;
}
.contact-form-wrap {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
  padding: 2.5rem;
  transition: border-color 0.3s;
  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.45);
  }
  @media (max-width: 599px) {
    padding: 1.5rem;
  }
}
.confirm-dialog {
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
}
// Honeypot — kept in the DOM for bots but removed from view & a11y tree.
.hp-field {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
</style>
