{{ define "otel-collector.global" }}
  {{- $globalDefaults := dict "security" (dict "tls" (dict "enabled" true)) -}}
  {{ if .Values.global }}
    {{- mergeOverwrite $globalDefaults .Values.global | toJson -}}
  {{ else }}
    {{- $globalDefaults | toJson }}
  {{ end }}
{{ end }}

{{/*
Expand the name of the chart.
*/}}
{{- define "otel-collector.name" -}}
{{- default .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "otel-collector.chart" -}}
{{- printf "%s-%s" (include "otel-collector.name" .) .Chart.Version | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "otel-collector.selectorLabels" -}}
app.kubernetes.io/name: {{ include "otel-collector.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "otel-collector.labels" -}}
helm.sh/chart: {{ include "otel-collector.chart" . }}
{{ include "otel-collector.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Generate default exporter
*/}}
{{- define "otel-collector.exporter" -}}
{{- $x := "debug" }}
{{- if .Values.otel.clickHouse.enabled }}
    {{- $x = "clickhouse" }}
{{- end }}
{{- print $x -}}
{{- end }}

{{/*
Usage: {{ template "otel-collector.configJobs" (list . "pod" "https") }}
*/}}
{{- define "otel-collector.configJobs" -}}
{{- $root := index . 0 -}}
{{- $role := index . 1 -}}
{{- $g := fromJson (include "otel-collector.global" $root) -}}
{{- $scheme := ternary "https" "http" (index $g "security" "tls" "enabled") -}}
{{- $kind := $role -}}
{{- if eq $role "endpoints" }}
  {{- $kind = "service" }}
{{- end }}
- job_name: k8s-{{ $role }}-15s-{{ $scheme }}
  scrape_interval: 15s
  scrape_timeout: 10s
  scheme: {{ $scheme }}
  tls_config:
    insecure_skip_verify: true
  kubernetes_sd_configs:
    - role: {{ $role }}
      namespaces:
        names:
          - {{ $root.Release.Namespace | quote }}
  relabel_configs:
    - source_labels:
        - __meta_kubernetes_{{ $kind }}_annotation_prometheus_io_scrape_interval
      action: keep
      regex: '^15s$'
    - source_labels:
        - __meta_kubernetes_{{ $kind }}_annotation_prometheus_io_scrape_role
      action: keep
      regex: '^{{ $role }}$'
    - source_labels:
        - __meta_kubernetes_{{ $kind }}_annotation_prometheus_io_port
      action: keep
    {{- if eq $role "service" }}
      target_label: __meta_kubernetes_service_port_number
    {{- else }}
      target_label: __meta_kubernetes_pod_container_port_number
    {{- end }}
    - source_labels:
        - __address__
      regex: .*:\d+
      action: keep
    - source_labels:
        - __meta_kubernetes_{{ $kind }}_annotation_prometheus_io_path
      action: replace
      regex: (.+)
      target_label: __metrics_path__
    - source_labels:
    {{- if eq $role "service" }}
        - __meta_kubernetes_service_port_name
    {{- else }}
        - __meta_kubernetes_pod_container_port_name
    {{- end }}
        - __meta_kubernetes_{{ $kind }}_annotation_prometheus_io_scheme
      action: keep
      regex: ^(({{ $scheme }}-.*metrics.*;{{ $scheme }})|({{ $scheme }}-.*metrics.*;)|(.*;{{ $scheme }}))$
    - source_labels:
        - __address__
        - __meta_kubernetes_{{ $kind }}_annotation_prometheus_io_port
      action: replace
      regex: ((?:\[.+\])|(?:.+))(?::\d+);(\d+)
      replacement: $1:$2
      target_label: __address__
    - source_labels:
        - __meta_kubernetes_namespace
      action: replace
      target_label: namespace
    - source_labels:
    {{- if eq $role "pod" }}
        - __meta_kubernetes_pod_label_app_kubernetes_io_name
    {{- else }}
        - __meta_kubernetes_service_name
    {{- end }}
      action: replace
      target_label: service_name
{{- if ne $role "service" }}
    - source_labels:
        - __meta_kubernetes_pod_name
      action: replace
      target_label: pod_name
    - source_labels:
        - __meta_kubernetes_pod_phase
      regex: Pending|Succeeded|Failed|Completed
      action: drop
    - source_labels:
    {{- if eq $role "pod" }}
        - __meta_kubernetes_pod_annotation_prometheus_io_node_label
    {{- else }}
        - __meta_kubernetes_service_annotation_prometheus_io_node_label
    {{- end }}
        - __meta_kubernetes_pod_node_name
      regex: "true;(.*)"
      replacement: $1
      target_label: node_name
{{- end }}
{{- end }}