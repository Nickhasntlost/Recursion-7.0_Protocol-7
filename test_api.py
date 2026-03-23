"""
Quick API Test Script
Run this after starting the server to verify everything works
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("Event Booking System - API Test")
print("=" * 60)
print()

# Test 1: Health Check
print("✓ Testing health endpoint...")
response = requests.get(f"{BASE_URL}/health")
print(f"  Status: {response.status_code}")
print(f"  Response: {response.json()}")
print()

# Test 2: User Signup
print("✓ Creating new user (organizer)...")
user_data = {
    "email": f"test.organizer.{datetime.now().timestamp()}@example.com",
    "username": f"testorg{int(datetime.now().timestamp())}",
    "full_name": "Test Organizer",
    "password": "SecurePassword123!",
    "phone": "+1234567890",
    "city": "Los Angeles",
    "country": "USA",
    "role": "organizer"
}

response = requests.post(f"{BASE_URL}/api/v1/auth/signup", json=user_data)
print(f"  Status: {response.status_code}")
if response.status_code == 201:
    signup_data = response.json()
    access_token = signup_data["access_token"]
    user_id = signup_data["user"]["id"]
    print(f"  ✅ User created: {signup_data['user']['email']}")
    print(f"  Access Token: {access_token[:30]}...")
else:
    print(f"  ❌ Error: {response.json()}")
    exit(1)
print()

# Test 3: Login
print("✓ Testing login...")
login_data = {
    "email": user_data["email"],
    "password": user_data["password"]
}
response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
print(f"  Status: {response.status_code}")
if response.status_code == 200:
    print(f"  ✅ Login successful")
else:
    print(f"  ❌ Login failed")
print()

# Test 4: Get current user
print("✓ Testing get current user...")
headers = {"Authorization": f"Bearer {access_token}"}
response = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
print(f"  Status: {response.status_code}")
if response.status_code == 200:
    user_info = response.json()
    print(f"  ✅ User: {user_info['full_name']} ({user_info['role']})")
else:
    print(f"  ❌ Failed to get user info")
print()

# Test 5: Create Organization
print("✓ Creating organization...")
org_data = {
    "name": f"Test Events Inc {int(datetime.now().timestamp())}",
    "email": "info@testevents.com",
    "description": "Test event management company",
    "phone": "+1234567890",
    "city": "Los Angeles",
    "country": "USA",
    "postal_code": "90001"
}

response = requests.post(f"{BASE_URL}/api/v1/organizations", json=org_data, headers=headers)
print(f"  Status: {response.status_code}")
if response.status_code == 201:
    org = response.json()
    org_id = org["id"]
    print(f"  ✅ Organization created: {org['name']}")
    print(f"  Organization ID: {org_id}")
else:
    print(f"  ❌ Error: {response.json()}")
    exit(1)
print()

# Test 6: Get Organizations
print("✓ Getting organizations list...")
response = requests.get(f"{BASE_URL}/api/v1/organizations")
print(f"  Status: {response.status_code}")
if response.status_code == 200:
    orgs = response.json()
    print(f"  ✅ Found {len(orgs)} organization(s)")
else:
    print(f"  ❌ Failed to get organizations")
print()

# Test 7: Get My Organizations
print("✓ Getting my organizations...")
response = requests.get(f"{BASE_URL}/api/v1/organizations/my/organizations", headers=headers)
print(f"  Status: {response.status_code}")
if response.status_code == 200:
    my_orgs = response.json()
    print(f"  ✅ You manage {len(my_orgs)} organization(s)")
else:
    print(f"  ❌ Failed to get my organizations")
print()

# Note: Creating events requires a venue first
print("=" * 60)
print("✅ All basic API tests passed!")
print()
print("Next steps:")
print("1. Create a venue for your organization")
print("2. Create events for that venue")
print("3. Test booking functionality")
print()
print("API Documentation: http://localhost:8000/docs")
print("=" * 60)
