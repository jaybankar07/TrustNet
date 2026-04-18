import os
import subprocess
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trustnet.settings')
# Overwrite DATABASE_URL in env to force Postgres engine for sql generation
os.environ['DATABASE_URL'] = 'postgresql://postgres:postgres@localhost:5432/postgres'

django.setup()

apps = ['accounts', 'companies', 'events', 'feed', 'jobs', 'promotions', 'referrals', 'trust', 'wallet']

with open('schema.sql', 'w') as f:
    f.write("-- TRUSTNET POSTGRESQL SCHEMA\n\n")
    for app in apps:
        f.write(f"-- App: {app}\n")
        try:
            output = subprocess.check_output(['python', 'manage.py', 'sqlmigrate', app, '0001'],
                                             env=os.environ, text=True)
            f.write(output)
            f.write("\n\n")
        except subprocess.CalledProcessError as e:
            print(f"Failed for {app}: {e.stderr}")
            pass

print("Done")
