FROM python:3.11

WORKDIR /tests/load

# Comme le contexte est déjà tests/load, on copie directement les fichiers
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY stress_test.py .

CMD ["python", "stress_test.py"]
