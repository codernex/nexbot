import boto3
from fastapi import UploadFile

R2_ACCOUNT_ID = "39c3993f79d1cb0ee7d02372a4947674"
R2_BUCKET = "chatbot"
R2_ACCESS_KEY_ID = "92a23b5a237a33def75bde8bcf4f98ed"
R2_SECRET_ACCESS_KEY = (
    "529f72c12e549d765a4ef4326d37f93989d7d7d20e6283c1d5654b4bff01da5c"
)
R2_ENDPOINT_URL = "https://39c3993f79d1cb0ee7d02372a4947674.r2.cloudflarestorage.com"
R2_BUCKET_URL = "https://chatbot.codernex.dev"


s3_client = boto3.client(
    service_name="s3",
    endpoint_url=R2_ENDPOINT_URL,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    region_name="auto",
)


def upload_file(file: UploadFile):
    KEY = f"Documents/{file.filename}"
    s3_client.upload_file(
        file.file,  # ফাইল অবজেক্ট
        R2_BUCKET,  # বাকেট নাম
        KEY,  # S3-তে ফাইলের নাম (Key)
        ExtraArgs={
            "ContentType": file.content_type  # ব্রাউজারে ফাইলটি ওপেন বা প্রিভিউ করার জন্য জরুরি
        },
    )
    return KEY


def get_file(key: str):
    response = s3_client.get_object(Bucket=R2_BUCKET, Key=key)
    return response
