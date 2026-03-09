FROM python:3.10-slim
WORKDIR /eatsMapWeb

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 讓COPY重新執行
ARG CACHEBUST=1
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]