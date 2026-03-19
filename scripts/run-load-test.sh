#!/bin/bash
# Script pour lancer le test de charge et récupérer les résultats

set -e

PROJECT_ID="cloud-computing-490021"
LOAD_TEST_IMAGE="europe-west9-docker.pkg.dev/$PROJECT_ID/netflix-repo/load-test:v1"
NAMESPACE="default"

echo "🚀 Déploiement du job de test de charge..."
kubectl apply -f k8s/load-test-job.yaml

echo "⏳ Attente du démarrage du pod..."
sleep 10

echo "📊 Surveillance du test de charge..."
while [ $(kubectl get job netflix-load-test -o jsonpath='{.status.completions}') != "1" ]; do
    DURATION=$(kubectl get job netflix-load-test -o jsonpath='{.status.active}')
    STATUS=$(kubectl get pod -l job-name=netflix-load-test -o jsonpath='{.items[0].status.phase}')
    echo "   Status: $STATUS | Duration: $(kubectl get job netflix-load-test -o jsonpath='{.metadata.managedFields[0].time}')"
    sleep 10
done

echo "✅ Test complété!"
echo ""
echo "📈 Résultats:"
kubectl logs job/netflix-load-test
