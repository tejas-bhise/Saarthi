import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Replace internal URL with public URL if needed
if "railway.internal" in DATABASE_URL:
    print("⚠️ You're using internal Railway URL. Please update .env with DATABASE_PUBLIC_URL from Railway dashboard.")
    print("Go to: Railway → PostgreSQL → Variables → DATABASE_PUBLIC_URL")
    exit(1)

print(f"📡 Connecting to database...")

# Connect to database
try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    print("✅ Connected to database!")
    
    # Read SQL file
    with open("../database/schema.sql", "r") as f:
        sql = f.read()
    
    print("📝 Running schema.sql...")
    
    # Execute SQL
    cursor.execute(sql)
    conn.commit()
    
    print("✅ Tables created successfully!")
    
    # Verify tables
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    
    tables = cursor.fetchall()
    
    print("\n📊 Tables in database:")
    for table in tables:
        print(f"  ✅ {table[0]}")
    
    cursor.close()
    conn.close()
    
    print("\n🎉 Database setup complete!")

except Exception as e:
    print(f"❌ Error: {e}")
    print("\n💡 Make sure:")
    print("1. DATABASE_URL in .env is the PUBLIC url (has rlwy.net)")
    print("2. Get it from: Railway → PostgreSQL → Variables → DATABASE_PUBLIC_URL")
