<template>
  <section id="contact" class="section-contact" style="border-bottom: none">
    <v-container class="px-6 px-md-10" fluid>
      <v-row>
        <!-- Left: title + description + social icons -->
        <v-col cols="12" md="5">
          <UiRevealBlock>
            <UiEyebrow class="mb-4">{{ $t("contact.section") }}</UiEyebrow>
            <UiDisplayTitle tag="h2" level="xl">
              {{ $t("contact.title_1") }}<br />
              <span class="text-muted">{{ $t("contact.title_em") }}</span>
            </UiDisplayTitle>
            <p class="type-body-lg text-muted contact-desc mt-6">
              {{ $t("contact.desc") }}
            </p>

            <!-- Social icons -->
            <div class="mt-8">
              <UiEyebrow tone="muted" class="mb-3">
                {{ $t("contact.socials") }}
              </UiEyebrow>
              <div class="d-flex ga-3">
                <v-btn
                  v-for="social in socials"
                  :key="social.icon"
                  :href="social.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  :icon="social.icon"
                  variant="outlined"
                  rounded="circle"
                  size="small"
                />
              </div>
            </div>
          </UiRevealBlock>
        </v-col>

        <!-- Right: contact form -->
        <v-col cols="12" md="7">
          <UiRevealBlock :delay="200">
            <div class="contact-form-wrap hairline-interactive">
              <v-form ref="formRef" @submit.prevent="submitForm">
                <v-text-field
                  v-model="form.name"
                  :label="$t('contact.form_name')"
                  class="mb-1"
                  :rules="[rules.name]"
                  validate-on="blur"
                  density="comfortable"
                />
                <v-text-field
                  v-model="form.email"
                  :label="$t('contact.form_email')"
                  type="email"
                  class="mb-1"
                  :rules="[rules.email, rules.emailFormat]"
                  validate-on="blur"
                  density="comfortable"
                />
                <v-textarea
                  v-model="form.message"
                  :label="$t('contact.form_message')"
                  class="mb-2"
                  :rules="[rules.message]"
                  validate-on="blur"
                  rows="5"
                  auto-grow
                  density="comfortable"
                />

                <!-- Feedback message -->
                <v-fade-transition>
                  <v-alert
                    v-if="sent"
                    type="success"
                    variant="tonal"
                    class="mb-4"
                    density="compact"
                    icon="mdi-check-circle"
                  >
                    {{ $t("contact.form_success") }}
                  </v-alert>
                  <v-alert
                    v-else-if="errorMsg"
                    type="error"
                    variant="tonal"
                    class="mb-4"
                    density="compact"
                    icon="mdi-alert-circle"
                  >
                    {{ errorMsg }}
                  </v-alert>
                </v-fade-transition>

                <v-btn
                  type="submit"
                  size="large"
                  :loading="sending"
                  :disabled="!canSubmit"
                  append-icon="mdi-arrow-right"
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
      <v-card color="surface" class="confirm-dialog">
        <v-card-title class="type-title pa-6 pb-2">
          {{ $t("contact.confirm_title") }}
        </v-card-title>
        <v-card-text class="type-body-md text-muted pa-6 pt-2">
          {{ $t("contact.confirm_text") }}
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            @click="showConfirm = false"
          >
            {{ $t("contact.confirm_cancel") }}
          </v-btn>
          <v-btn
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
})

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
  { icon: "mdi-github", href: "https://github.com/hamedbouare9" },
  {
    icon: "mdi-linkedin",
    href: "https://www.linkedin.com/in/hamed-bouare-phd-0a1981112/",
  },
]

// Step 1: validate form, then show confirmation dialog
const submitForm = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  showConfirm.value = true
}

// Step 2: send email via EmailJS after user confirms
const sendEmail = async () => {
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

    showConfirm.value = false
    sent.value = true
    form.name = ""
    form.email = ""
    form.message = ""
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
// Vertical rhythm follows the shared section token — the two duplicated
// breakpoint blocks that used to live here are gone.
.section-contact {
  padding: var(--section-pad) 0;
  background: rgb(var(--v-theme-background));
}

// Form panel — hairline surface; hover comes from .hairline-interactive.
.contact-form-wrap {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-border));
  padding: 2.5rem;

  @media (max-width: 599px) {
    padding: 1.5rem;
  }
}

.confirm-dialog {
  border: 1px solid rgb(var(--v-theme-border));
}
</style>
