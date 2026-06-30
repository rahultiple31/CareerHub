{{- define "hiresphere.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "hiresphere.databaseFullname" -}}
{{- include "hiresphere.componentFullname" (dict "root" . "component" "database") -}}
{{- end -}}

{{- define "hiresphere.databaseSecretName" -}}
{{- default (include "hiresphere.databaseFullname" .) .Values.database.auth.existingSecret -}}
{{- end -}}

{{- define "hiresphere.apiSecretName" -}}
{{- default (include "hiresphere.componentFullname" (dict "root" . "component" "api")) .Values.api.existingSecret -}}
{{- end -}}

{{- define "hiresphere.storageSecretName" -}}
{{- default (include "hiresphere.componentFullname" (dict "root" . "component" "s3")) .Values.storage.s3.existingSecret -}}
{{- end -}}

{{- define "hiresphere.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "hiresphere.componentFullname" -}}
{{- printf "%s-%s" (include "hiresphere.fullname" .root) .component | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "hiresphere.labels" -}}
helm.sh/chart: {{ include "hiresphere.chart" . }}
{{ include "hiresphere.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "hiresphere.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "hiresphere.selectorLabels" -}}
app.kubernetes.io/name: {{ include "hiresphere.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "hiresphere.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "hiresphere.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{- define "hiresphere.image" -}}
{{- if .Values.image.digest -}}
{{- printf "%s@%s" .Values.image.repository .Values.image.digest -}}
{{- else -}}
{{- printf "%s:%s" .Values.image.repository (.Values.image.tag | default .Chart.AppVersion) -}}
{{- end -}}
{{- end -}}

{{- define "hiresphere.apiImage" -}}
{{- printf "%s:%s" .Values.api.image.repository (.Values.api.image.tag | default .Chart.AppVersion) -}}
{{- end -}}
