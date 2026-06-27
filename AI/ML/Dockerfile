FROM python:3.11-slim

WORKDIR /code

# Copy requirements file first to utilize Docker build cache
COPY requirements_flask_api.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements_flask_api.txt

# Copy the rest of the application files
COPY . .

# Expose port 7860 (required by Hugging Face Spaces)
EXPOSE 7860

# Run the Flask app using Gunicorn on port 7860
CMD ["gunicorn", "-b", "0.0.0.0:7860", "medicine_prediction_flask_api:app"]
