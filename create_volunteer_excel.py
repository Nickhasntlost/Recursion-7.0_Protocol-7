"""
Create sample volunteer Excel file with Indian data
Run: python create_volunteer_excel.py
"""
import pandas as pd

# Sample volunteer data (Indian names, phone numbers, roles)
volunteers_data = {
    'name': [
        'Rahul Sharma',
        'Priya Patel',
        'Amit Kumar',
        'Neha Singh',
        'Arjun Reddy',
        'Kavya Iyer',
        'Rohan Desai'
    ],
    'email': [
        'rahul.sharma@gmail.com',
        'priya.patel@yahoo.com',
        'amit.kumar@outlook.com',
        'neha.singh@gmail.com',
        'arjun.reddy@gmail.com',
        'kavya.iyer@hotmail.com',
        'rohan.desai@gmail.com'
    ],
    'phone': [
        '+919876543210',
        '+919823456789',
        '+919765432108',
        '+919654321098',
        '+919543210987',
        '+919432109876',
        '+919321098765'
    ],
    'role': [
        'Registration Coordinator',
        'Security Lead',
        'Tech Support',
        'Food & Beverage',
        'Stage Manager',
        'Volunteer Coordinator',
        'Parking Management'
    ],
    'skills': [
        'Customer Service, Communication',
        'Security, First Aid, Crowd Management',
        'IT Support, Audio Visual, Photography',
        'Hospitality, Catering, Customer Service',
        'Event Management, Sound, Lighting',
        'Leadership, Team Management, Planning',
        'Traffic Control, Security, Communication'
    ],
    'availability': [
        'Full day',
        'Morning shift',
        'Full day',
        'Afternoon shift',
        'Full day',
        'Morning shift',
        'Evening shift'
    ],
    'emergency_contact_name': [
        'Priya Sharma',
        'Amit Patel',
        'Sunita Kumar',
        'Rajesh Singh',
        'Lakshmi Reddy',
        'Venkat Iyer',
        'Meera Desai'
    ],
    'emergency_contact_phone': [
        '+919876543211',
        '+919823456790',
        '+919765432109',
        '+919654321099',
        '+919543210988',
        '+919432109877',
        '+919321098766'
    ]
}

# Create DataFrame
df = pd.DataFrame(volunteers_data)

# Save to Excel
output_file = 'volunteers_sample_india.xlsx'
df.to_excel(output_file, index=False, engine='openpyxl')

print(f"Excel file created: {output_file}")
print(f"Total volunteers: {len(df)}")
print("\nPreview:")
print(df[['name', 'email', 'role']].to_string(index=False))
print(f"\nFile ready to upload to API!")
