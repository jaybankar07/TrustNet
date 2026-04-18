import os
import subprocess
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trustnet.settings')

django.setup()

apps = ['accounts', 'companies', 'events', 'feed', 'jobs', 'promotions', 'referrals', 'trust', 'wallet']
migrations = {
    'accounts': '0001',
    'companies': '0001',
    'events': '0001',
    'feed': '0001',
    'jobs': '0001',
    'promotions': '0001',
    'referrals': '0001',
    'trust': '0001',
    'wallet': '0001',
}

sql = "-- TRUSTNET DATABASE SCHEMA\n\n"

for app in apps:
    sql += f"-- App: {app}\n"
    try:
        output = subprocess.check_output(['python', 'manage.py', 'sqlmigrate', app, migrations[app]],
                                         text=True)
        sql += output + "\n\n"
    except Exception as e:
        sql += f"-- Failed to generate for {app}: {e}\n\n"

with open('C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\85f530ea-df89-4362-a02c-0789533eb11f\\database_schema.md', 'w') as f:
    f.write("# Database Schema SQL\n\nYou can copy and paste this into your Supabase SQL Editor to manually provision the tables if you'd like.\n\n```sql\n")
    f.write(sql)
    f.write("\n```\n")

print("Generated database_schema.md")
