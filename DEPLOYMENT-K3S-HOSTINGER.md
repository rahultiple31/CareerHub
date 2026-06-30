# hiresphere K3s Deployment

## Stack Format

Frontend: React.js
Backend: Node.js API service
Database: PostgreSQL
Cache: Redis
File Storage: Separate storage/backup through PostgreSQL PVC and AWS S3
Search: Elasticsearch / OpenSearch
Web Server: Nginx
Deployment: K3s Kubernetes
Monitoring: Uptime + logs
Server: Hostinger VPS KVM 8
Ingress: Nginx Ingress
SSL: cert-manager SSL
Object Storage: AWS S3 for PDF/images/data

## Hostinger KVM 8 Prerequisites

- Ubuntu 22.04 or 24.04 on Hostinger VPS KVM 8.
- DNS `A` record pointing your app domain to the VPS public IP.
- Open firewall ports `80` and `443`.
- Set the OpenSearch host kernel limit before starting search workloads:

```bash
sudo sysctl -w vm.max_map_count=262144
echo 'vm.max_map_count=262144' | sudo tee /etc/sysctl.d/99-opensearch.conf
sudo sysctl --system
```

- K3s installed with the bundled Traefik disabled if you use Nginx Ingress:

```bash
curl -sfL https://get.k3s.io | sh -s - --disable traefik
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

## Cluster Add-ons

Install Nginx Ingress:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/cloud/deploy.yaml
```

Install cert-manager:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.2/cert-manager.yaml
```

Create the Let's Encrypt ClusterIssuer:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: admin@example.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
```

## Secrets

Create PostgreSQL credentials:

```bash
kubectl create namespace hiresphere
kubectl create secret generic hiresphere-database-credentials \
  -n hiresphere \
  --from-literal=postgres-database=hiresphere \
  --from-literal=postgres-username=hiresphere \
  --from-literal=postgres-password='replace-with-strong-password'
```

Create S3 credentials:

```bash
kubectl create secret generic hiresphere-s3-credentials \
  -n hiresphere \
  --from-literal=aws-access-key-id='replace-with-access-key' \
  --from-literal=aws-secret-access-key='replace-with-secret-key'
```

## Deploy

```bash
helm upgrade --install hiresphere charts/hiresphere \
  --namespace hiresphere \
  --create-namespace \
  --values charts/hiresphere/values-hostinger-k3s.yaml \
  --set ingress.hosts[0].host=app.example.com \
  --set ingress.tls[0].hosts[0]=app.example.com \
  --set ingress.tls[0].secretName=hiresphere-tls \
  --set api.appOrigin=https://app.example.com \
  --set database.auth.existingSecret=hiresphere-database-credentials \
  --set storage.s3.existingSecret=hiresphere-s3-credentials \
  --set storage.s3.bucket=your-s3-bucket \
  --set storage.s3.region=ap-south-1 \
  --set storage.s3.prefix=hiresphere
```

## Monitoring

Uptime checks:

```bash
curl -fsS https://app.example.com/healthz
curl -fsS https://app.example.com/api/v1/storage
```

Logs:

```bash
kubectl logs -n hiresphere deploy/hiresphere-gateway -f
kubectl logs -n hiresphere deploy/hiresphere-api -f
kubectl logs -n hiresphere deploy/hiresphere-redis -f
kubectl logs -n hiresphere statefulset/hiresphere-database -c postgresql -f
kubectl logs -n hiresphere statefulset/hiresphere-opensearch -f
```

Status:

```bash
kubectl get pods,svc,ingress,pvc,certificate -n hiresphere
```
