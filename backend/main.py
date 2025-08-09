
import os
from datetime import datetime
import uuid
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.requests import Request
from starlette.responses import JSONResponse
from jose import jwt
import mysql.connector
from azure.storage.blob import BlobServiceClient

app = FastAPI()

# Homepage route
@app.get("/")
def read_root():
    return {"message": "Welcome to the File Upload API! Use /docs for API documentation."}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE")
AZURE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=youraccount;AccountKey=yourkey;EndpointSuffix=core.windows.net"  # TODO: Replace with your real Azure connection string
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "root"
DB_NAME = "test"

blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)

# Connect to MySQL
conn = mysql.connector.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME
)
cur = conn.cursor()
cur.execute("""
CREATE TABLE IF NOT EXISTS uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255),
    filename VARCHAR(255),
    url VARCHAR(255),
    timestamp DATETIME
)
""")
conn.commit()


def verify_jwt(token: str):
    try:
        payload = jwt.decode(token, options={"verify_signature": False, "verify_aud": False})
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")



# For testing: dummy user object
def get_current_user():
    return {"sub": "testuser"}

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png", "image/gif"]:
        raise HTTPException(status_code=400, detail="Invalid file type")
    contents = await file.read()
    # Optionally, add file size check here if needed
    # if len(contents) > MAX_SIZE:
    #     raise HTTPException(status_code=400, detail="File too large")
    unique_name = f"{uuid.uuid4()}_{file.filename}"
    blob_client = blob_service_client.get_blob_client(container=AZURE_CONTAINER_NAME, blob=unique_name)
    blob_client.upload_blob(contents)
    url = blob_client.url
    # Use dummy user for testing
    cur.execute(
        "INSERT INTO uploads (user_id, filename, url, timestamp) VALUES (%s, %s, %s, %s)",
        ("testuser", unique_name, url, datetime.utcnow())
    )
    conn.commit()
    return {"filename": unique_name, "url": url}

@app.get("/files")
async def list_files():
    cur.execute("SELECT id, filename, url, timestamp FROM uploads WHERE user_id = %s ORDER BY timestamp DESC", ("testuser",))
    rows = cur.fetchall()
    return [
        {"id": r[0], "filename": r[1], "url": r[2], "timestamp": r[3].isoformat()} for r in rows
    ]
