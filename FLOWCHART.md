# hiresphere Flow Chart

## Stack Summary

Frontend: React.js
Backend: Node.js API service
Database: PostgreSQL
File Storage: PostgreSQL persistent volume plus AWS S3 for PDF/images/data
Web Server: Nginx
Deployment: K3s Kubernetes
Monitoring: Uptime endpoints plus Kubernetes logs
Server: Hostinger VPS KVM 8
Ingress: Nginx Ingress
SSL: cert-manager

## Production Runtime Flow

```mermaid
flowchart TD
  User[User Browser] --> DNS[Domain DNS A Record]
  DNS --> VPS[Hostinger VPS KVM 8]
  VPS --> K3s[K3s Kubernetes Cluster]
  K3s --> Ingress[Nginx Ingress Controller]
  Cert[cert-manager + Lets Encrypt] --> Ingress
  Ingress --> GatewaySvc[hiresphere Gateway Service]
  GatewaySvc --> GatewayPod[Nginx Gateway Pod]

  GatewayPod --> Root[React Gateway Shell]
  GatewayPod --> Workspace[workspace-service]
  GatewayPod --> Jobs[jobs-service]
  GatewayPod --> Projects[projects-service]
  GatewayPod --> Network[network-service]
  GatewayPod --> Interview[interview-service]
  GatewayPod --> Profile[profile-service]
  GatewayPod --> HR[hr-studio-service]
  GatewayPod --> Scale[scale-service]
  GatewayPod --> API[api-service]

  API --> PG[(PostgreSQL StatefulSet)]
  PG --> PVC[(PostgreSQL PVC / local-path)]
  API --> S3[(AWS S3 Bucket)]

  Ingress --> Health[/healthz uptime check/]
  API --> Ready[/readyz readiness check/]
  K3s --> Logs[kubectl logs]
```

## Frontend Application Flow

```mermaid
flowchart TD
  Browser[Browser loads /] --> GatewayReact[src/gateway-main.jsx]
  GatewayReact --> Sidebar[Navigation + role switcher]
  GatewayReact --> Search[Global search]
  GatewayReact --> Theme[Theme state]
  GatewayReact --> Iframe[Service iframe]

  Sidebar --> WorkspaceRoute[#workspace]
  Sidebar --> JobsRoute[#jobs]
  Sidebar --> ProjectsRoute[#projects]
  Sidebar --> NetworkRoute[#network]
  Sidebar --> InterviewRoute[#interview]
  Sidebar --> ProfileRoute[#profile]
  Sidebar --> HRRoute[#admin]
  Sidebar --> ScaleRoute[#architecture]

  Iframe --> ServiceMain[src/service-main.jsx]
  GatewayReact <-->|postMessage bridge| ServiceMain
  ServiceMain --> Data[src/data.js demo data]
  ProfileRoute --> LocalProfile[localStorage profile cache]
```

## Gateway Routing Flow

```mermaid
flowchart LR
  Request[HTTP Request] --> GatewayNginx[gateway/nginx.conf]

  GatewayNginx -->|/| Shell[index.html + React shell]
  GatewayNginx -->|/assets/| StaticAssets[Gateway static assets]
  GatewayNginx -->|/workspace/| WorkspaceSvc[workspace-service:8080]
  GatewayNginx -->|/jobs/| JobsSvc[jobs-service:8080]
  GatewayNginx -->|/projects/| ProjectsSvc[projects-service:8080]
  GatewayNginx -->|/network/| NetworkSvc[network-service:8080]
  GatewayNginx -->|/interview/| InterviewSvc[interview-service:8080]
  GatewayNginx -->|/profile/| ProfileSvc[profile-service:8080]
  GatewayNginx -->|/hr-studio/| HRSvc[hr-studio-service:8080]
  GatewayNginx -->|/scale/| ScaleSvc[scale-service:8080]
  GatewayNginx -->|/api/| APISvc[api-service:8080]
  GatewayNginx -->|/healthz| Health[ok]
```

## Backend And Storage Flow

```mermaid
flowchart TD
  API[services/api/server.mjs] --> Health[/GET /healthz/]
  API --> Ready[/GET /readyz/]
  API --> Storage[/GET /api/v1/storage/]
  API --> GetProfile[/GET /api/v1/profile/]
  API --> PutProfile[/PUT /api/v1/profile/]

  GetProfile --> Session[Signed hiresphere_session cookie]
  PutProfile --> Session
  PutProfile --> CSRF[x-hiresphere-csrf header]

  Session --> Users[(users table)]
  GetProfile --> CandidateProfiles[(candidate_profiles table)]
  PutProfile --> CandidateProfiles
  PutProfile --> Activity[(activity_events table)]
  Storage --> S3Config[AWS S3 bucket / region / prefix config]
  S3Config --> S3[(AWS S3 PDFs images data)]
  API --> FileAssets[(file_assets table)]
```

## K3s Deployment Flow

```mermaid
flowchart TD
  Dev[Developer / CI] --> Build[Build Docker images]
  Build --> Registry[Docker Hub / GHCR image registry]
  Dev --> Helm[helm upgrade --install]
  Helm --> Values[values-hostinger-k3s.yaml]
  Values --> K3s[K3s on Hostinger KVM 8]

  K3s --> GatewayDeploy[Gateway Deployment]
  K3s --> MicroDeploy[8 React micro-frontend Deployments]
  K3s --> APIDeploy[API Deployment]
  K3s --> DBStateful[PostgreSQL StatefulSet]
  K3s --> Ingress[Nginx Ingress]
  K3s --> HPA[Gateway HPA]
  K3s --> Secrets[Kubernetes Secrets]

  Secrets --> DBSecret[PostgreSQL credentials]
  Secrets --> APISecret[Session secret]
  Secrets --> S3Secret[AWS S3 credentials]
  CertIssuer[cert-manager ClusterIssuer] --> Ingress
```

## CI/CD Flow

```mermaid
flowchart TD
  Push[Push / PR / Manual dispatch] --> Validate[Validate app and chart]
  Validate --> Node[Node 22 install]
  Node --> ReactBuild[npm run build:all]
  ReactBuild --> HelmLint[helm lint + helm template]
  HelmLint --> ComposeTest[docker compose up smoke test]
  ComposeTest --> GatewayImage[Publish gateway image]
  ComposeTest --> ServiceImages[Publish service images]
  ServiceImages --> Registry[Container registry]
  GatewayImage --> Registry
```

## Local Docker Compose Flow

```mermaid
flowchart TD
  Compose[docker compose up --build] --> DB[postgres:16-alpine]
  DB --> API[hiresphere-api:local]
  API --> Gateway[hiresphere-gateway:local]

  Workspace[hiresphere-workspace:local] --> Gateway
  Jobs[hiresphere-jobs:local] --> Gateway
  Projects[hiresphere-projects:local] --> Gateway
  Network[hiresphere-network:local] --> Gateway
  Interview[hiresphere-interview:local] --> Gateway
  Profile[hiresphere-profile:local] --> Gateway
  HR[hiresphere-hr-studio:local] --> Gateway
  Scale[hiresphere-scale:local] --> Gateway

  Gateway --> Browser[http://localhost:8080]
```
