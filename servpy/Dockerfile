FROM python:3.8.4-slim
WORKDIR /proj
COPY ./servpy/requirements.txt .
RUN \
    pip install -r ./requirements.txt
COPY ./client/static ../client/static
COPY ./servpy .
CMD ["python", "api.py"]
