{{- define "default-labels" -}}
app.kubernetes.io/name: "components"
app.kubernetes.io/version: "{{ .Chart.Version }}"
{{- end -}}
