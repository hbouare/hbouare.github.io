export function useFormatDate() {
  const { locale } = useI18n()

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(
      locale.value === "fr" ? "fr-FR" : "en-GB",
      { year: "numeric", month: "long", day: "numeric" },
    )

  return { formatDate }
}
