FROM python:3.11

WORKDIR /tests/load
COPY tests/load/requirements.txt .
RUN pip install -r requirements.txt

COPY tests/load/stress_test.py .