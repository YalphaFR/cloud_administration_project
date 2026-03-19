#!/bin/bash
set -e

echo "🚀 Suppression de l'ancien job..."
kubectl delete job netflix-load-test --ignore-not-found

echo "🚀 Déploiement du job de test de charge..."
kubectl apply -f k8s/load-test-job.yaml

echo "⏳ Attente du démarrage du pod..."
sleep 5

POD_NAME=$(kubectl get pods -l job-name=netflix-load-test -o jsonpath='{.items[0].metadata.name}')

echo "📊 Pod détecté : $POD_NAME"
echo "📊 Attente de la fin du test..."

# Attendre que le job soit terminé
while true; do
    STATUS=$(kubectl get job netflix-load-test -o jsonpath='{.status.succeeded}')
    if [ "$STATUS" == "1" ]; then
        break
    fi
    echo "   → Test en cours..."
    sleep 5
done

echo "✅ Test complété!"
echo ""
echo "📈 Résultats:"
kubectl logs job/netflix-load-test
