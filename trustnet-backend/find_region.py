import psycopg2
import sys

REGIONS = [
    "ap-south-1", "ap-southeast-1", "ap-northeast-1", "ap-northeast-2", "ap-southeast-2",
    "ca-central-1", "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3", "sa-east-1",
    "us-east-1", "us-east-2", "us-west-1", "us-west-2"
]

password = "TeamKalyug@20"
project_id = "jetsbppoijqqnyuuepav"

found = None

for region in REGIONS:
    host = f"aws-0-{region}.pooler.supabase.com"
    try:
        print(f"Testing {host}...")
        conn = psycopg2.connect(
            host=host,
            user=f"postgres.{project_id}",
            password=password,
            port=5432,
            dbname="postgres",
            connect_timeout=3,
            sslmode="require"
        )
        print(f"SUCCESS! Found region: {region}")
        conn.close()
        found = region
        break
    except psycopg2.OperationalError as e:
        msg = str(e)
        if "Tenant or user not found" in msg:
            continue
        elif "password authentication failed" in msg:
            print("Password failed but region is CORRECT: ", region)
            found = region
            break
        else:
            print(f"Different Error on {region}: ", msg.strip())
            continue
    except Exception as e:
        continue

if found:
    print(f"--RESULT--aws-0-{found}--")
else:
    print("FAILED TO FIND REGION")
