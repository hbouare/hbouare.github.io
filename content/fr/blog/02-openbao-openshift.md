---
slug: openbao-openshift
title: "Gérer ses secrets avec OpenBao sur OpenShift"
date: "2025-01-20"
readTime: 6
tags: ["OpenBao", "OpenShift", "Kubernetes", "DevSecOps"]
excerpt: "Retour d'expérience sur la migration de HashiCorp Vault vers OpenBao pour la gestion de secrets dans un cluster OpenShift, avec des CronJobs pour la rotation automatique."
---

# Gérer ses secrets avec OpenBao sur OpenShift

OpenBao est le fork open-source de HashiCorp Vault, né après le changement de licence de Vault en 2023. Voici comment je l'ai intégré dans notre infrastructure OpenShift chez EDF.

## Pourquoi OpenBao ?

- **Licence BSL → MPL 2.0** : OpenBao reste vraiment open source
- **Compatibilité** : API identique à Vault, migration transparente
- **Communauté** : Gouvernance Linux Foundation

## Configuration KV v2

```python
import hvac

client = hvac.Client(url='https://openbao.cluster.local')
client.auth.kubernetes.login(
    role='portfolio-app',
    jwt=open('/var/run/secrets/kubernetes.io/serviceaccount/token').read()
)

# Lire un secret
secret = client.secrets.kv.v2.read_secret_version(
    path='portfolio/db-credentials',
    mount_point='kv'
)
db_password = secret['data']['data']['password']
```

## CronJob de rotation

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: secret-rotator
spec:
  schedule: "0 2 * * 0"  # Chaque dimanche à 2h
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccountName: secret-rotator-sa
          containers:
          - name: rotator
            image: python:3.12-slim
            command: ["python", "/scripts/rotate.py"]
```

La rotation automatique réduit drastiquement la surface d'attaque en cas de fuite de credentials.
