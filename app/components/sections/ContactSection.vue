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
            <h2 class="contact-title font-playfair">
              {{ $t("contact.title_1") }}<br />
              <em class="text-primary">{{ $t("contact.title_em") }}</em>
            </h2>
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
              <v-form
                ref="formRef"
                v-model="formValid"
                @submit.prevent="submitForm"
              >
                <v-text-field
                  v-model="form.name"
                  :label="$t('contact.form_name')"
                  variant="outlined"
                  color="primary"
                  base-color="muted"
                  bg-color="surface"
                  class="font-mono mb-1"
                  :rules="[rules.required]"
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
                  :rules="[rules.required, rules.email]"
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
                  :rules="[rules.required]"
                  rows="5"
                  auto-grow
                  density="comfortable"
                  rounded="0"
                />
                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-4"
                >
                  <v-btn
                    type="submit"
                    color="primary"
                    variant="flat"
                    rounded="0"
                    size="large"
                    class="font-mono text-uppercase"
                    :loading="sending"
                    :disabled="!canSubmit"
                    append-icon="mdi-arrow-right"
                  >
                    {{ $t("contact.form_send") }}
                  </v-btn>
                  <v-fade-transition>
                    <span
                      v-if="sent"
                      class="font-mono text-primary text-caption"
                    >
                      <v-icon
                        size="small"
                        icon="mdi-check-circle"
                        class="mr-1"
                      />
                      {{ $t("contact.form_success") }}
                    </span>
                    <span
                      v-else-if="errorMsg"
                      class="font-mono text-error text-caption"
                    >
                      <v-icon
                        size="small"
                        icon="mdi-alert-circle"
                        class="mr-1"
                      />
                      {{ errorMsg }}
                    </span>
                  </v-fade-transition>
                </div>
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
import emailjs from '@emailjs/browser'

const { t } = useI18n()
const config = useRuntimeConfig()

const formRef = ref()
const formValid = ref(false)
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
  required: (v: string) => !!v?.trim() || " ",
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || " ",
}

const canSubmit = computed(() => {
  return !!form.name.trim()
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    && !!form.message.trim()
})

const socials = [
  { icon: "mdi-github", href: "https://github.com/hamed" },
  { icon: "mdi-linkedin", href: "https://linkedin.com/in/hamed" },
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
        from_name: form.name,
        from_email: form.email,
        message: form.message,
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
</style>
