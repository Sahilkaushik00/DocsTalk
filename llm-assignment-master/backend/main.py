from fastapi import FastAPI, UploadFile, Form
from starlette.responses import JSONResponse
import requests  # Assuming a basic HTTP client for external API calls (if needed)
import os  # For file handling (temporary storage)
from google.cloud import aiplatform

app = FastAPI()

# Replace with project ID, location, and endpoint name (from Gemini deployment)
PROJECT_ID = os.environ.get("GEMINI_PROJECT_ID")
LOCATION = os.environ.get("GEMINI_LOCATION")
ENDPOINT_NAME = os.environ.get("GEMINI_ENDPOINT_NAME")


def call_gemini_api(text):
    # Authenticate with service account key
    credentials = aiplatform.Credentials.from_service_account_info(
        os.environ.get("GEMINI_SERVICE_ACCOUNT_KEY_FILE")
    )

    # Create a TextInputs instance
    text_inputs = aiplatform.TextInputs(content=text)

    # Construct the endpoint resource name
    endpoint = aiplatform.Endpoint(project=PROJECT_ID, location=LOCATION, endpoint=ENDPOINT_NAME)

    # Make predictions using the endpoint
    try:
        response = endpoint.predict(inputs=text_inputs)
        return response.predictions[0]  # Assuming single prediction output
    except Exception as e:
        return {"error": str(e)}


@app.post("/predict")
async def predict(file: UploadFile = None, query: str = Form(...), description: str = Form(None)):
    try:
        # Handle file upload (if present)
        if file:
            content = file.read().decode("utf-8")
            # Temporary storage for demonstration (replace with robust storage)
            with open(f"uploads/{file.filename}", "wb") as f:
                f.write(content.encode("utf-8"))
        else:
            content = ""

        # Combine content and query for processing
        combined_text = f"{content}\nQuery: {query}"
        if description:
            combined_text += f"\nDescription: {description}"

        # Call Gemini API with combined text
        response = call_gemini_api(combined_text)
        if "error" in response:
            return JSONResponse(response, status_code=500)
        return JSONResponse(response)

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
